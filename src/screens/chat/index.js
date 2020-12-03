import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {Text, View} from 'react-native';

export default class ChatContacs extends Component {
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
      <View>
        <Text> Kontak Chat </Text>
      </View>
    );
  }
}
