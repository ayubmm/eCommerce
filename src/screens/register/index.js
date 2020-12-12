import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Button,
  KeyboardAvoidingView,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    };
  }

  register() {
    let data = new FormData();

    for (let key in this.state) {
      data.append(key, this.state[key]);
    }
    // console.log(data);
    fetch('https://tokonline.herokuapp.com/api/register', {
      method: 'POST',
      // headers: {
      //   Accept: 'application/json',
      //   'Content-Type': 'application/json',
      // },
      body: data,

      // JSON.stringify({
      //   name: this.state.name,
      //   email: this.state.email,
      //   password: this.state.password,
      //   password_confirmation: this.state.password_confirmation,
      // }),
    })
      .then((res) => res.json())
      .then((resJson) => {
        // console.log(resJson);
        if (resJson.user) {
          this.setState({
            email: '',
            password: '',
            password_confirmation: '',
            name: '',
          });
          this.props.navigation.navigate('Login');
          ToastAndroid.show(
            'You have created a new account! Please Login',
            ToastAndroid.LONG,
          );
        }
      })
      .catch((err) => console.log(err));
  }

  render() {
    const {name, email, password, password_confirmation} = this.state;

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.boxContainer}>
            <Icon name={'person-add'} size={80} color={'#bfbfbfd6'} />
            <KeyboardAvoidingView style={styles.registrationBox}>
              <Text style={styles.title}>Registration</Text>
              <TextInput
                style={styles.input}
                autoCompleteType={'username'}
                autoCapitalize={'words'}
                placeholder={'Username'}
                value={name}
                onChangeText={(text) => this.setState({name: text})}
              />
              <TextInput
                style={styles.input}
                autoCompleteType={'email'}
                autoCapitalize={'none'}
                placeholder={'Email'}
                value={email}
                keyboardType={'email-address'}
                onChangeText={(text) => this.setState({email: text})}
              />
              <TextInput
                style={styles.input}
                secureTextEntry={true}
                autoCapitalize={'none'}
                autoCompleteType={'password'}
                placeholder={'Password'}
                value={password}
                onChangeText={(text) => this.setState({password: text})}
              />
              <TextInput
                style={styles.input}
                secureTextEntry={true}
                autoCapitalize={'none'}
                autoCompleteType={'password'}
                placeholder={'Password Confirmation'}
                value={password_confirmation}
                onChangeText={(text) =>
                  this.setState({password_confirmation: text})
                }
              />
              <View style={styles.button}>
                <Button
                  color={'#0d4e4e'}
                  title={'Register'}
                  onPress={() => this.register()}
                />
              </View>
              <Text style={styles.loginText}>
                Already have an account? Please
                <Text
                  style={[
                    styles.loginText,
                    {fontWeight: 'bold', color: '#0d4e4e'},
                  ]}
                  onPress={() => this.props.navigation.navigate('Login')}>
                  {' '}
                  Login
                </Text>
              </Text>
            </KeyboardAvoidingView>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 10,
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
