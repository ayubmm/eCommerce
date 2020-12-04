/* eslint-disable react-native/no-inline-styles */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ToastAndroid,
} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {connect} from 'react-redux';
import Pusher from 'pusher-js/react-native';

// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

var pusher = new Pusher('5debdef554206164cb9e', {
  cluster: 'ap1',
});

var channel = pusher.subscribe('my-channel');

class Chat extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chats: [],
      loading: true,
      message: '',
      refreshing: false,
    };

    channel.bind('my-event', () => {
      this.getChat();
    });
  }

  sendChat() {
    let form = new FormData();
    form.append('message', this.state.message);
    console.log('ini message ', form);

    const endpoint =
      'https://tokonline.herokuapp.com/api/message/' + this.props.id_seller;
    AsyncStorage.getItem('token').then((token) => {
      console.log('mulai ambil chat');
      fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      })
        .then((res) => res.json())
        .then((resJson) => {
          console.log('ini resJson dari kirim message', resJson);
          this.setState({loading: true});
        })
        .catch((err) => console.log('ini error dari get chat == ', err));
    });
  }

  getChat() {
    const endpoint =
      'https://tokonline.herokuapp.com/api/message/' + this.props.id_seller;
    AsyncStorage.getItem('token').then((token) => {
      console.log('mulai ambil chat');
      fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((resJson) => {
          console.log('ini resJson dari message', resJson);
          this.setState(() => {
            resJson.data.sort((a, b) => a.id - b.id);
            return {chats: resJson.data, loading: false};
          });
        })
        .catch((err) => console.log('ini error dari get chat == ', err));
    });
  }

  componentDidMount() {
    console.log('ini id seller === ', this.props.id_seller);
    console.log('ini id user === ', this.props.user.id);
    this.getChat();
  }

  // componentDidUpdate() {
  //   if (this.state.loading) {
  //     this.getChat();
  //   }
  // }

  onRefresh() {
    this.getChat();
    this.setState({refreshing: false});
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          ref={(ref) => (this.scrollView = ref)}
          onContentSizeChange={() => {
            this.scrollView.scrollToEnd({animated: true});
          }}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => this.onRefresh()}
            />
          }
          contentContainerStyle={styles.scrollView}>
          {this.state.chats.length > 0
            ? this.state.chats.map((v, i) => {
                if (v.from !== this.props.user.id) {
                  return (
                    <View style={styles.chatBubbleContainerLeft} key={i}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.chatBubbleLeft}>
                        <Text style={styles.chatText}>{v.message}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                } else {
                  return (
                    <View style={styles.chatBubbleContainerRight} key={i}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.chatBubbleRight}>
                        <Text style={styles.chatText}>{v.message}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                }
              })
            : !this.state.loading && (
                <Text style={styles.empty}>Chat is empty</Text>
              )}
          {this.state.loading && (
            <ActivityIndicator
              size={50}
              color={'white'}
              style={styles.loading}
            />
          )}
        </ScrollView>
        <View style={styles.footer}>
          <TextInput
            value={this.state.message}
            style={styles.input}
            multiline={true}
            placeholder={'message...'}
            onChangeText={(text) => this.setState({message: text})}
          />
          <TouchableOpacity onPress={() => this.sendChat()}>
            <IonIcons name={'send'} size={45} color={'#eee'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d4e4e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    alignItems: 'center',
    backgroundColor: 'teal',
  },
  input: {
    flex: 1,
    maxHeight: 150,
    fontSize: 18,
  },
  loading: {
    margin: 100,
  },
  empty: {
    color: 'white',
    fontSize: 25,
  },
  header: {
    width: '100%',
    height: '5%',
    backgroundColor: '#ededed',
    flexDirection: 'row',
    elevation: 10,
  },
  scrollView: {
    flexGrow: 1,
    backgroundColor: '#0d4e4e',
    paddingVertical: 8,
    alignItems: 'center',
  },
  chatBubbleContainerLeft: {
    paddingHorizontal: 10,
    width: Dimensions.get('window').width,
    flexDirection: 'row',
    marginVertical: 5,
  },
  chatBubbleContainerRight: {
    paddingHorizontal: 10,
    width: Dimensions.get('window').width,
    flexDirection: 'row-reverse',
    marginVertical: 5,
  },
  chatBubbleLeft: {
    backgroundColor: 'green',
    padding: 5,
    borderRadius: 10,
    borderTopLeftRadius: 0,
    maxWidth: '80%',
  },
  chatBubbleRight: {
    backgroundColor: '#0202ca',
    padding: 5,
    borderRadius: 10,
    borderTopRightRadius: 0,
    maxWidth: '80%',
  },
  chatText: {
    color: '#eee',
    fontSize: 18,
    marginVertical: 8,
    alignSelf: 'center',
  },
});

const mapStateToProps = (state) => {
  return {
    user: state,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeUser: (data) => dispatch({type: 'CHANGE/USER', payload: data}),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
