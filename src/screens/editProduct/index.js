import React, {Component} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ToastAndroid,
  Alert,
  View,
} from 'react-native';
// import CurrencyFormat from 'react-currency-format';
import ImagePicker from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';

class EditPropduct extends Component {
  state = {
    id: this.props.product.id,
    name: this.props.product.name,
    weight: this.props.product.weight, //untuk dikirim ke backend integer
    category: this.props.product.category_id, //untuk dikirim ke backend integer
    price: this.props.product.price, //untuk dikirim ke backend integer
    description: this.props.product.description,
    image: {
      name: 'default',
      type: 'image/jpeg',
      uri: this.props.product.image,
    },
    stock: this.props.product.stock,
    customer_id: this.props.product.customer_id,
  };

  deleteConf = () => {
    Alert.alert(
      'Hapus Produk',
      'Apakah anda yakin untuk menghapus produk?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Hapus',
          onPress: () => this.deleteProduct(),
        },
      ],
      {cancelable: false},
    );
  };

  deleteProduct() {
    console.log('Mulai hapus produk id == ', this.state.id);
    AsyncStorage.getItem('token')
      .then((token) => {
        const endpoint =
          'https://tokonline.herokuapp.com/api/product/' + this.state.id;
        fetch(endpoint, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((resJson) => {
            console.log('ini status resjson delete', resJson.status);
            console.log(resJson);
            if (resJson.status === 'Success') {
              this.props.load();
              this.props.close();
              this.props.changeUser({didUpdate: true});
            }
          })
          .catch((err) => console.log('dari catch Delete ===', err));
      })
      .catch((err) => console.log(err));
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
    console.log('Mulai form Data');
    const {
      name,
      price,
      weight,
      category,
      description,
      image,
      stock,
      customer_id,
    } = this.state;

    let dataToSend = {
      name: name,
      description: description,
      category_id: parseFloat(category),
      price: parseFloat(price),
      weight: parseFloat(weight),
      image: image,
      stock: parseFloat(stock),
      customer_id: customer_id,
      _method: 'PUT',
    };
    let form = new FormData();

    for (let key in dataToSend) {
      form.append(key, dataToSend[key]);
    }
    console.log('ini form Data', form);
    return form;
  }

  sendData(token, form) {
    console.log('Mulai send Data, ini id product ==', this.state.id);
    const endpoint =
      'https://tokonline.herokuapp.com/api/product/' + this.state.id;
    fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    })
      .then((res) => res.json())
      .then((resJson) => {
        console.log('Ini resjson edit produk', resJson);
        if (resJson.status === 'Success') {
          console.log('harusnya close');
          this.props.close();
          this.props.load();
          this.props.changeUser({didUpdate: true});
          ToastAndroid.show('Barang berhasil diupdate!', 5000);
        }
      })
      .catch((err) => console.log('dari catch send Data ===', err));
  }

  gettoken() {
    console.log('Mulai ambil token');
    AsyncStorage.getItem('token')
      .then((token) => {
        if (this.state.image.name) {
          this.sendData(token, this.formData());
        } else {
          ToastAndroid.show('Gambar harus diisi terlebih dahulu!', 2500);
        }
      })
      .catch((err) => console.log(err));
  }

  render() {
    console.log('ini product detail::: ', this.props.product);
    return (
      <>
        <Text style={styles.title}> Edit Produk </Text>
        <ScrollView contentContainerStyle={styles.container}>
          <View>
            <TouchableOpacity onPress={() => this.takePic()}>
              <Image source={this.state.image} style={styles.image} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => this.deleteConf()}>
              <Text style={styles.addText}>Hapus Produk</Text>
            </TouchableOpacity>
          </View>
          <Text>Nama Produk</Text>
          <TextInput
            autoCapitalize={'words'}
            value={this.state.name}
            placeholder={'Nama Produk'}
            onChangeText={(text) => this.setState({name: text})}
            style={styles.input}
          />
          <Text>Kategori Produk</Text>
          <TextInput
            value={this.state.category.toString()}
            placeholder={'Kategori Produk'}
            onChangeText={(text) => this.setState({category: text})}
            style={styles.input}
          />
          <Text>Harga Produk (Rp)</Text>
          <TextInput
            value={this.state.price.toString()}
            placeholder={'Harga Produk'}
            onChangeText={(text) => this.setState({price: text})}
            style={styles.input}
          />
          <Text>Berat Produk (gram)</Text>
          <TextInput
            value={this.state.weight.toString()}
            placeholder={'Berat Produk'}
            onChangeText={(text) => this.setState({weight: text})}
            style={styles.input}
          />
          <Text>Stock Produk</Text>
          <TextInput
            value={this.state.stock.toString()}
            multiline={true}
            placeholder={'Stock Produk'}
            onChangeText={(text) => this.setState({stock: text})}
            style={styles.input}
          />
          <Text>Deskripsi Produk</Text>
          <TextInput
            value={this.state.description}
            multiline={true}
            placeholder={'Deskripsi Produk'}
            onChangeText={(text) => this.setState({description: text})}
            style={[styles.input, styles.inputDesc]}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => this.gettoken()}>
            <Text style={styles.addText}>Edit Produk</Text>
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
  deleteButton: {
    backgroundColor: 'red',
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

export default connect(mapStateToProps, mapDispatchToProps)(EditPropduct);
