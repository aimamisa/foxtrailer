/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  Image,
  FlatList,
  Dimensions,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  BackHandler,
  Alert,
  View,
  Text,
  ImageBackground,
  TouchableNativeFeedback,
  StyleSheet,
} from 'react-native';
import {
  Container,
  Header,
  Title,
  Content,
  Footer,
  FooterTab,
  Button,
  Left,
  Right,
  Body,
  Icon,
  Card,
} from 'native-base';
import {connect} from 'react-redux';
import {Actions} from 'react-native-router-flux';
import {
  handleAndroidBackButton,
  removeAndroidBackButtonHandler,
} from '../../services/androidBackButton';
import Colors from '../../constants/Colors';
import {fetch_details} from '../../reducers/home';
const {height, width} = Dimensions.get('window');

export class DetailPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      refreshing: false,
      data: {},
      pageId: 1,
    };
  }

  componentDidMount() {
    const {data, fetch_details, mediaType, pageId} = this.props;
    console.log('logging details page data', this.props);

    const param = {
      media_type: mediaType,
      movie_id: data.id,
    };
    // console.log(this.props);
    fetch_details(param);
    handleAndroidBackButton(this._backButton);
    this.setState({pageId: pageId});
    if (this.state.pageId === data.id) {
      this.setState({data});
    }
  }

  componentWillUnmount() {
    removeAndroidBackButtonHandler();
  }

  _backButton = () => {
    const {prevData} = this.props;
    // console.log('_backbutton log', this.props);
    console.log('prevData', prevData);

    if (Actions.currentScene === 'DetailPage') {
      Actions.popTo(`${this.props.from}`);
    } else {
      Actions.pop();
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.details !== this.props.details) {
      const {
        details,
        images,
        videos,
        // recommend,
        similar,
      } = this.props.details;
      const {data} = this.state;
      // if (this.props.data.id  === this.state.pageId) {
      console.log(
        'this.props.data.id  === this.props.pageId',
        this.props.data.id,
        this.props.pageId,
      );

      this.setState(
        {
          data: Object.assign(data, details),
          images,
          videos,
          // recommend,
          similar,
          pageId: this.state.pageId + 1,
        },
        () => {
          console.log('udated this.props', this.props);
        },
      );
      // }
    }
  }

  _onRefresh = () => {
    // const { fetch_trending } = this.props;
    this.setState({refreshing: false}, () => {
      // fetch_trending();
    });
  };

  get_year = year => new Date(`${year}`).getFullYear();
  get_genres = genres => {
    let newGenre = '';
    genres &&
      genres.forEach((element, index) => {
        if (genres.length - 1 !== index) {
          newGenre = newGenre + element.name + ', ';
        } else {
          newGenre = newGenre + element.name + '.';
        }
      });
    return (
      <View>
        <Text
          style={{
            color: Colors.white,
            margin: 3,
          }}>
          {newGenre}
        </Text>
      </View>
    );
  };
  get_overview = overview => {
    return (
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 5,
          marginVertical: 5,
          backgroundColor: '#0006',
        }}>
        <View>
          <Text
            style={{
              fontSize: 20,
              color: '#ffffff',
              fontWeight: 'bold',
              marginBottom: 2,
            }}>
            Overview
          </Text>
        </View>
        <View>
          <Text
            style={{
              fontSize: 16,
              color: '#ffffff',
              letterSpacing: 0.5,
              // lineHeight: 2,
            }}>
            {overview}
          </Text>
        </View>
      </View>
    );
  };
  get_facts = data => {
    const {
      status,
      release_date,
      original_language,
      budget,
      revenue,
      runtime,
    } = data;

    let facts = [
      {que: 'Status', ans: `${status}`, id: 1},
      {que: 'Release Date', ans: `${release_date}`, id: 2},
      {
        que: 'Original Language',
        ans: `${original_language}`,
        id: 3,
      },
      {que: 'Runtime', ans: `${runtime}mins`, id: 4},
      {que: 'Budget', ans: `$${budget}`, id: 5},
      {que: 'Revenue', ans: `$${revenue}`, id: 6},
    ];

    let facts_view = facts.map(element => {
      return (
        element.ans &&
        element.ans !== 'undefined' && (
          <View
            key={element.id}
            style={{
              width: width / 3,
              marginVertical: 5,
              marginRight: 5,
            }}>
            <Text
              style={{
                fontSize: 16,
                color: '#ffffff',
                fontWeight: 'bold',
              }}>
              {element.que}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: '#ffffff',
              }}>
              {element.ans ? element.ans : 'N/L'}
            </Text>
          </View>
        )
      );
    });

    return (
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 5,
          marginVertical: 5,
        }}>
        <View>
          <Text
            style={{
              fontSize: 20,
              color: '#ffffff',
              fontWeight: 'bold',
              marginBottom: 5,
            }}>
            Facts
          </Text>
        </View>
        <View
          style={{
            width,
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}>
          {facts_view}
        </View>
      </View>
    );
  };

  videoLists = data => {
    const sliceData = data && data.filter(value => value.type === 'Trailer');
    return (
      <View style={{backgroundColor: '#fff3'}}>
        {this.mediaTitle('Trailers', data)}
        <FlatList
          data={sliceData}
          horizontal={true}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => {
            return this.get_videos(item, data);
          }}
        />
      </View>
    );
  };

  mediaTitle = (title, data) => {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          // backgroundColor: Colors.sec_lighter,
          padding: 5,
        }}>
        <View style={{paddingHorizontal: 10}}>
          <Text style={{color: '#ffffff', fontWeight: 'bold', fontSize: 20}}>
            {title}
          </Text>
        </View>
        {title !== 'Similar' && (
          <TouchableOpacity
            onPress={() =>
              Actions.SeeMoreVideos({
                data,
                poster: this.props.data.poster_path,
              })
            } // this.openSeeAll(title, mediaData, mediaType)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <View style={{paddingHorizontal: 1}}>
              <Text style={{color: '#FFFFFF'}}>SEE MORE</Text>
            </View>
            <View style={{paddingHorizontal: 10}}>
              <Icon
                name="ios-arrow-forward"
                style={{color: '#FFFFFF', fontSize: 20}}
              />
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  get_videos = data => {
    const {key} = data;
    // console.log('video key', data);

    return (
      <View
        key={key}
        style={{
          width: 250,
          borderColor: 'transparent',
          borderWidth: 1,
          margin: 5,
        }}>
        <View>
          <View>
            <Image
              source={{
                uri: `http://i3.ytimg.com/vi/${key}/maxresdefault.jpg`,
              }}
              style={{width: 250, height: 150}}
            />
          </View>
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              // right: 0,
              top: 0,
              padding: 10,
              width: 250,
              justifyContent: 'center',
              backgroundColor: '#0001',
            }}>
            <Button
              transparent
              style={{alignSelf: 'center', padding: 50}}
              onPress={() => {
                // Alert.alert('Open video');
                Actions.YouTubeVideo({newLink: key});
              }}>
              <Icon
                name="play-circle"
                style={{
                  color: Colors.white,
                  fontSize: 50,
                  margin: 3,
                }}
              />
            </Button>
          </View>
        </View>
      </View>
    );
  };

  similar_list = data => {
    const sliceData = data && data.slice(0, 5);
    return (
      <View style={{backgroundColor: '#fff3'}}>
        {this.mediaTitle('Similar')}
        <FlatList
          data={sliceData}
          horizontal={true}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => {
            return this.get_similar_images(item);
          }}
        />
      </View>
    );
  };

  get_similar_images = data => {
    const {mediaType} = this.props;
    // console.log('data, dat', data,dat);

    const {poster_path, title, id, name, profile_path} = data;
    const newTitle = title ? title : name;
    const uri = poster_path ? poster_path : profile_path;
    return (
      <TouchableNativeFeedback
        key={`${id}`}
        style={{
          flex: 1,
          borderColor: 'transparent',
          borderWidth: 1,
        }}
        onPress={() => {
          // console.log('details prev', data, this.state.data);

          Actions.push('DetailPage', {
            data,
            from: `${this.props.from}`,
            mediaType,
          });
        }}
        useForeground={true}>
        <View style={{margin: 2}}>
          <View>
            <Image
              source={{
                uri: `https://image.tmdb.org/t/p/original${uri}`,
              }}
              style={{width: 150, height: 200}}
            />
          </View>
          <View
            style={{
              width: 220,
              position: 'absolute',
              bottom: 0,
              left: 0,
              padding: 10,
              backgroundColor: '#00060880',
            }}>
            <Text style={{color: '#FFFFFF'}}>{newTitle}</Text>
          </View>
        </View>
      </TouchableNativeFeedback>
    );
  };

  get_similar = data => {
    return this.similar_list(data);
  };

  render() {
    const {mediaType} = this.props;
    const {refreshing, data, videos, similar} = this.state;
    const {
      poster_path,
      backdrop_path,
      title,
      name,
      profile_path,
      release_date,
      overview,
      genres,
      vote_average,
      first_air_date,
    } = data;
    const newTitle = title ? title : name;
    const poster = profile_path ? profile_path : poster_path;
    const backdrop_img = backdrop_path ? backdrop_path : profile_path;
    const releaseDate = first_air_date ? first_air_date : release_date;
    const link = 'https://www.youtube.com/watch?v=R4NwwXEfs2A';
    // console.log('detailspage data', data);

    return (
      <Container>
        <ImageBackground
          source={{
            uri: `https://image.tmdb.org/t/p/original${poster}`,
          }}
          progressiveRenderingEnabled={true}
          blurRadius={40}
          style={[{width: '100%', height: '100%'}]}>
          <Header
            transparent
            style={{
              backgroundColor: Colors.sec_transparent,
            }}
            androidStatusBarColor={'transparent'}>
            <Left>
              <Button onPress={() => this._backButton()} transparent>
                <Icon name="arrow-back" />
              </Button>
            </Left>
            <Body />
            <Right>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                }}>
                <View>
                  <Button onPress={() => Actions.pop()} transparent>
                    <Icon name="star-outline" />
                  </Button>
                </View>
                <View>
                  <Button onPress={() => Actions.pop()} transparent>
                    <Icon name="share" />
                  </Button>
                </View>
                <View>
                  <Button onPress={() => this._backButton()} transparent>
                    <Icon name="more" />
                  </Button>
                </View>
              </View>
            </Right>
          </Header>
          <Content
            // contentContainerStyle={{ flex: 1, width }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={this._onRefresh}
              />
            }>
            <View>
              <Image
                source={{
                  uri: `https://image.tmdb.org/t/p/original${backdrop_img}`,
                }}
                style={[
                  {
                    width,
                    height: 200,
                    flexWrap: 'wrap',
                  },
                ]}
                progressiveRenderingEnabled={true}
              />
            </View>
            <View style={{flexDirection: 'row'}}>
              <View>
                <Image
                  source={{
                    uri: `https://image.tmdb.org/t/p/original${poster}`,
                  }}
                  style={[
                    {
                      width: 100,
                      height: 150,
                      marginTop: -34,
                      marginHorizontal: 12,
                    },
                  ]}
                  progressiveRenderingEnabled={true}
                />
              </View>
              <View
                style={{
                  width: width - 130,
                  flexDirection: 'column',
                  marginTop: 10,
                }}>
                <View>
                  <Text
                    style={{
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: 'bold',
                    }}>
                    {newTitle}{' '}
                    {releaseDate && (
                      <Text
                        style={{
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: '100',
                        }}>
                        ({this.get_year(releaseDate)})
                      </Text>
                    )}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 5,
                  }}>
                  <View style={{justifyContent: 'center'}}>
                    <Image
                      source={require('../../assets/stack-green.png')}
                      style={[
                        {
                          width: 30,
                          height: 30,
                        },
                      ]}
                      progressiveRenderingEnabled={true}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Icon
                      name="star"
                      style={{
                        color: Colors.white,
                        fontSize: 25,
                        margin: 3,
                      }}
                    />
                    <Text
                      style={{
                        color: Colors.white,
                        fontSize: 20,
                        margin: 3,
                      }}>
                      {vote_average}
                    </Text>
                  </View>

                  <TouchableNativeFeedback
                    onPress={() =>
                      Actions.YouTubeVideo({
                        newLink: videos[0].key,
                      })
                    }>
                    <View
                      style={{
                        // flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Icon
                        style={{
                          color: Colors.white,
                          fontSize: 25,
                          margin: 3,
                        }}
                        name="play-circle"
                      />
                      <Text
                        style={{
                          color: Colors.white,
                          fontSize: 20,
                          margin: 3,
                        }}>
                        Trailer
                      </Text>
                    </View>
                  </TouchableNativeFeedback>
                </View>
                {this.get_genres(genres)}
              </View>
            </View>
            {this.get_overview(overview)}
            {this.get_facts(data)}
            {/* {mediaType === 'movie' && this.get_facts(data)} */}
            {this.videoLists(videos)}
            {this.get_similar(similar)}
          </Content>
        </ImageBackground>
      </Container>
    );
  }
}

var styles = StyleSheet.create({
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});

const mapStateToProps = state => ({
  details: state.home.details,
});

const mapDispatchToProps = {fetch_details};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DetailPage);