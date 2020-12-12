import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {
  Image,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Chat from './eachChat';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {connect} from 'react-redux';

class ChatContacts extends Component {
  state = {
    contacts: [],
    chatModal: false,
    loading: true,
    refreshing: false,
    id_seller: null,
  };

  getContacts() {
    console.log('Mulai ambil kontak...');

    const endpoint = 'https://tokonline.herokuapp.com/api/kontak';

    AsyncStorage.getItem('token')
      .then((token) => {
        if (token) {
          this.setState({loading: true});
          fetch(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((res) => res.json())
            .then((resJson) => {
              // console.log('Ini hasil resjson kontak', resJson);
              this.setState({contacts: resJson.data, loading: false});
            });
        }
      })
      .catch((err) => console.log('error from chat contacts', err));
  }

  componentDidMount() {
    // console.log('ini props email ===', this.props.user.email);
    if (this.props.user.email) {
      this.getContacts();
    }
  }

  onRefresh() {
    this.getContacts();
    this.setState({refreshing: false});
  }

  render() {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={() => this.onRefresh()}
          />
        }
        contentContainerStyle={styles.scrollView}>
        {!this.props.user.email ? (
          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.6}
            onPress={() => {
              this.props.navigation.closeDrawer();
              this.props.navigation.navigate('Auth');
            }}>
            <Text style={styles.logoutText}>Log In or Register</Text>
          </TouchableOpacity>
        ) : this.state.loading === true ? (
          <ActivityIndicator size={50} color={'white'} style={styles.loading} />
        ) : this.state.contacts.length === 0 ? (
          <Text style={styles.empty}>There are no chats</Text>
        ) : (
          this.state.loading === false &&
          this.state.contacts.map((v, i) => {
            return (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.contacts}
                onPress={() => {
                  this.setState({chatModal: true, id_seller: v.id});
                }}
                key={i}>
                <View style={styles.contactsCont}>
                  {v.image ? (
                    <Image style={styles.image} source={{uri: v.image}} />
                  ) : (
                    <View style={styles.image}>
                      <IonIcons name={'person'} color={'black'} size={40} />
                    </View>
                  )}
                  <Text numberOfLines={1} style={styles.contactsName}>
                    {v.name}
                  </Text>
                </View>
                <IonIcons name={'chevron-forward'} size={55} />
              </TouchableOpacity>
            );
          })
        )}
        <Modal
          visible={this.state.chatModal}
          onRequestClose={() => this.setState({chatModal: false})}>
          <Chat id_seller={this.state.id_seller} />
        </Modal>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    backgroundColor: 'teal',
    padding: 6,
    alignItems: 'center',
  },
  logoutText: {
    fontWeight: 'bold',
    color: 'teal',
  },
  loginButton: {
    marginTop: 100,
    backgroundColor: 'white',
    padding: 13,
    borderRadius: 10,
  },
  loading: {
    margin: 100,
  },
  contactsCont: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 85,
    height: 85,
  },
  contactsName: {
    alignSelf: 'center',
    fontSize: 15,
  },
  empty: {
    color: 'white',
    fontSize: 25,
  },
  contacts: {
    width: '100%',
    padding: 2,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eee',
    marginVertical: 5,
    borderRadius: 10,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
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

export default connect(mapStateToProps, mapDispatchToProps)(ChatContacts);
