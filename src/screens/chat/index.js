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
} from 'react-native';
import Chat from './eachChat';

export default class ChatContacts extends Component {
  state = {
    contacts: [],
    chatModal: false,
    id_seller: null,
  };

  getContacts() {
    console.log('Mulai ambil kontak...');

    const endpoint = 'https://tokonline.herokuapp.com/api/kontak';

    AsyncStorage.getItem('token')
      .then((token) => {
        if (token) {
          fetch(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((res) => res.json())
            .then((resJson) => {
              console.log('Ini hasil resjson kontak', resJson);
              this.setState({contacts: resJson.data});
            });
        }
      })
      .catch((err) => console.log('error from chat contacts', err));
  }

  componentDidMount() {
    this.getContacts();
  }

  render() {
    return (
      <ScrollView contentContainerStyle={styles.scrollView}>
        {this.state.contacts.map((v, i) => {
          return (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.contacts}
              onPress={() => this.setState({id_seller: v.id, chatModal: true})}
              key={i}>
              <View>
                <Image style={styles.image} source={{uri: v.image}} />
                <Text>{v.name}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
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
    backgroundColor: '#f2f2f2',
    padding: 6,
    alignItems: 'center',
  },
  contacts: {
    width: '100%',
    padding: 5,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: '#eee',
  },
});
