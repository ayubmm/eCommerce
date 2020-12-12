import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Button,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class Login extends Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
    };
  }

  saveLocalToken(token) {
    AsyncStorage.setItem('token', token, () =>
      this.props.navigation.replace('Splash'),
    ).catch((err) => console.log(err));
  }

  login() {
    let data = new FormData();

    for (let key in this.state) {
      data.append(key, this.state[key]);
    }
    console.log(data);

    fetch('https://tokonline.herokuapp.com/api/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      body: data,
    })
      .then((res) => res.json())
      .then((resJson) => {
        console.log('ini resjon === ', resJson);
        if (resJson.token) {
          this.saveLocalToken(resJson.token);
          ToastAndroid.show('Log in successful!', ToastAndroid.LONG);
        } else {
          ToastAndroid.show(
            'Log in failed, please try again!',
            ToastAndroid.LONG,
          );
        }
      })
      .catch((err) => console.log(err));
  }

  render() {
    const {email, password} = this.state;

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.boxContainer}>
            <Icon name={'person'} size={80} color={'#bfbfbfd6'} />
            <View style={styles.registrationBox}>
              <Text style={styles.title}>Login</Text>

              <TextInput
                style={styles.input}
                autoCompleteType={'email'}
                placeholder={'Email'}
                autoCapitalize={'none'}
                value={email}
                onChangeText={(text) => this.setState({email: text})}
                keyboardType={'email-address'}
              />

              <TextInput
                style={styles.input}
                autoCompleteType={'password'}
                autoCapitalize={'none'}
                secureTextEntry={true}
                placeholder={'Password'}
                value={password}
                onChangeText={(text) => this.setState({password: text})}
              />

              <View style={styles.button}>
                <Button
                  color={'#0d4e4e'}
                  title={'Login'}
                  onPress={() => {
                    this.login();
                  }}
                />
              </View>

              <Text style={styles.loginText}>
                Do not have an account? Please
                <Text
                  style={[
                    styles.loginText,
                    {fontWeight: 'bold', color: '#0d4e4e'},
                  ]}
                  onPress={() =>
                    this.props.navigation.navigate('Registration')
                  }>
                  {' '}
                  Register
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: '#0d4e4e',
  },
  scrollContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  boxContainer: {
    width: '90%',
    minHeight: 600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registrationBox: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#bfbfbfd6',
    borderRadius: 10,
    marginTop: 15,
    padding: 15,
    elevation: 10,
  },
  title: {
    fontSize: 36,
    marginBottom: 15,
    color: '#0d4e4e',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#dbdbdb',
    width: '100%',
    fontSize: 18,
    color: '#0d4e4e',
    margin: 4,
    borderRadius: 6,
  },
  loginText: {
    marginTop: 20,
    fontSize: 17,
    textAlign: 'center',
  },
  button: {
    margin: 10,
    width: 150,
    padding: 10,
  },
});
