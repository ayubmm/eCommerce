import React, {Component} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ToastAndroid,
} from 'react-native';
// import CurrencyFormat from 'react-currency-format';
import ImagePicker from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';

class EditUser extends Component {
  state = {
    name: this.props.user.name,
    address: this.props.user.alamat,
    phone: this.props.user.no_telpon,
    password: '',
    image: {
      name: 'oldProfile',
      type: 'image/jpeg',
      uri: this.checkPic(),
    },
  };

  checkPic() {
    if (this.props.user.image) {
      return this.props.user.image;
    } else {
      return 'https://static.thenounproject.com/png/187803-200.png';
    }
  }

  takePic() {
    ImagePicker.showImagePicker(
      {
        noData: true,
        saveToPhotos: true,
        title: 'Select Photo',
        storageOptions: {
          skipBackup: false,
          path: 'images',
        },
      },
      (response) => {
        console.log('Response = ', response);

        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else {
          const source = {
            uri: response.uri,
            name: response.fileName,
            type: response.type,
          };
          this.setState({
            image: source,
          });
        }
      },
    );
  }

  formData() {
    console.log('Mulai form Data User');
    const {name, address, phone, password, image} = this.state;

    let dataToSend = {
      name: name,
      alamat: address,
      no_telpon: phone,
      password_confirmation: password,
      image: image,
    };
    let form = new FormData();

    for (let key in dataToSend) {
      form.append(key, dataToSend[key]);
    }

    console.log('ini form Data User', form);
    return form;
  }

  sendData(token, form) {
    console.log('Mulai send Data User');
    const endpoint = 'https://tokonline.herokuapp.com/api/profile';
    fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    })
      .then((res) => res.json())
      .then((resJson) => {
        console.log('ini resJson === ', resJson);
        if (resJson.status === 'Success') {
          this.props.changeUser(resJson.data);
          ToastAndroid.show(
            'Data berhasil diubah.\n' + resJson.data.name,
            3500,
          );
          this.props.close();
        } else {
          ToastAndroid.show('Maaf, update gagal.\n Silahkan coba lagi.', 3500);
        }
      })
      .catch((err) => console.log('dari catch send Data ===', err));
  }

  gettoken() {
    console.log('Mulai ambil token');
    AsyncStorage.getItem('token')
      .then((token) => {
        this.sendData(token, this.formData());
      })
      .catch((err) => console.log(err));
  }

  render() {
    return (
      <>
        <Text style={styles.title}> Edit Profile </Text>
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity onPress={() => this.takePic()}>
            <Image source={this.state.image} style={styles.image} />
          </TouchableOpacity>
          <Text>Nama</Text>
          <TextInput
            autoCapitalize={'words'}
            value={this.state.name}
            placeholder={'Nama'}
            onChangeText={(text) => this.setState({name: text})}
            style={styles.input}
          />
          <Text>Alamat</Text>
          <TextInput
            autoCapitalize={'words'}
            value={this.state.address}
            placeholder={'Alamat'}
            onChangeText={(text) => this.setState({address: text})}
            style={styles.input}
          />
          <Text>No. telpon</Text>
          <TextInput
            maxLength={10}
            value={this.state.phone.toString()}
            keyboardType={'phone-pad'}
            placeholder={'Telpon'}
            onChangeText={(text) => this.setState({phone: text})}
            style={styles.input}
          />
          <Text>Konfirmasi Password</Text>
          <TextInput
            autoCapitalize={'none'}
            secureTextEntry={true}
            autoCompleteType={'off'}
            value={this.state.password}
            placeholder={'Password'}
            onChangeText={(text) => this.setState({password: text})}
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => this.gettoken()}>
            <Text style={styles.addText}>Simpan Perubahan</Text>
          </TouchableOpacity>
        </ScrollView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 4,
  },
  title: {
    fontSize: 25,
    color: 'white',
    fontWeight: 'bold',
    alignSelf: 'center',
    height: 50,
    width: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: 'teal',
    elevation: 20,
  },
  image: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    margin: 3,
    borderRadius: 15,
  },
  inputDesc: {
    textAlignVertical: 'top',
    height: 300,
  },
  addButton: {
    backgroundColor: 'teal',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 10,
    margin: 20,
  },
  addText: {
    fontSize: 20,
    color: 'white',
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

export default connect(mapStateToProps, mapDispatchToProps)(EditUser);
