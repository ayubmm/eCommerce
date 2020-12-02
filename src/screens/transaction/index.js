import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import IonIcons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import CurrencyFormat from 'react-currency-format';
import ImagePicker from 'react-native-image-picker';

function Progress({item}) {
  let name = '';
  let color = '';
  if (item.status === '1') {
    name = 'progress-one';
    color = '#d1d110';
  } else if (item.status === '2') {
    name = 'progress-two';
    color = 'green';
  } else if (item.status === '3') {
    name = 'progress-full';
    color = 'blue';
  }
  return <Entypo name={name} size={30} color={color} />;
}

function OrderBox({products, getDetail}) {
  return products.map((v, i) => {
    return (
      <TouchableOpacity
        onPress={() => getDetail(v.id)}
        activeOpacity={0.8}
        key={i}
        style={styles.productContainer}>
        <View style={styles.ItemBoxText}>
          <Text style={styles.productName}>{v.tujuan}</Text>
          <CurrencyFormat
            value={v.jumlah_harga}
            displayType={'text'}
            thousandSeparator={'.'}
            decimalSeparator={','}
            prefix={'Rp.'}
            renderText={(value) => (
              <Text style={styles.productPrice}>
                Total Harga : {'\n'} {value}
              </Text>
            )}
          />
        </View>
        <TouchableOpacity style={styles.trashIcon}>
          <Progress item={v} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  });
}

export default class Transaction extends Component {
  state = {
    cartItems: [],
    cartDetail: [],
    refreshing: false,
    modal: false,
    id: '',
    name: '',
    transfer_to: '',
    transfer_date: '',
    amount: '', //int
    bukti: {
      name: '',
      type: 'image/jpeg',
      uri: '',
    }, //(image)
    loading: true,
  };

  onRefresh() {
    this.getHistory();
    this.setState({refreshing: false});
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
            bukti: source,
          });
        }
      },
    );
  }

  getDetail(id) {
    console.log('id pesanan', id);
    this.setState({modal: true, loading: true, id: id});
    AsyncStorage.getItem('token')
      .then((token) => {
        console.log('mulai ambil detail');

        const endpoint = 'https://tokonline.herokuapp.com/api/history/' + id;

        fetch(endpoint, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((resJson) => {
            console.log('resjson dari detail pesanan === ', resJson);
            if (resJson.status === 'Success') {
              this.setState({cartDetail: resJson.data, loading: false});
            }
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }

  getHistory() {
    AsyncStorage.getItem('token')
      .then((token) => {
        console.log('mulai ambil history');

        const endpoint = 'https://tokonline.herokuapp.com/api/history';

        fetch(endpoint, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((resJson) => {
            console.log('resjson dari gethistory === ', resJson.data);
            if (resJson.status === 'Success') {
              this.setState({cartItems: resJson.data});
            }
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }

  form() {
    const {name, amount, bukti, transfer_date, transfer_to} = this.state;
    let data = {
      name: name,
      amount: parseFloat(amount),
      transfer_date: transfer_date,
      transfer_to: transfer_to,
      bukti: bukti,
    };
    let form = new FormData();

    if (name && amount && transfer_date && transfer_to && bukti.name !== '') {
      for (let key in data) {
        form.append(key, data[key]);
      }
      console.log('Ini form konfirmasi === ', form);

      return form;
    } else {
      ToastAndroid.show('Lengkapi dahulu data di atas sebelum dikirim!', 5500);
    }
  }

  sendProof(id) {
    console.log('Mulai kirim konfirmasi pembayaran...');
    console.log('Ini id pesanan', id);
    const endpoint = 'https://tokonline.herokuapp.com/api/payment/' + id;

    AsyncStorage.getItem('token')
      .then((token) => {
        fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: this.form(),
        })
          .then((res) => res.json())
          .then((resJson) => {
            console.log(resJson);
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }

  componentDidMount() {
    this.getHistory();
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
        <OrderBox
          getDetail={(id) => this.getDetail(id)}
          products={this.state.cartItems}
        />
        <Modal
          visible={this.state.modal}
          onRequestClose={() => this.setState({modal: false})}>
          <ScrollView contentContainerStyle={styles.scrollView}>
            {this.state.loading ? (
              <ActivityIndicator
                style={{padding: 50}}
                size={45}
                color={'teal'}
              />
            ) : (
              <>
                {this.state.cartDetail.map((v, i) => {
                  return (
                    <View key={i} style={styles.productReview}>
                      <Text style={styles.reviewText}>
                        Jumlah pesanan : {v.jumlah}
                      </Text>
                      <Text style={styles.reviewText}>
                        Total Harga : {v.jumlah_harga}
                      </Text>
                    </View>
                  );
                })}
                <TextInput
                  style={styles.input}
                  value={this.state.name}
                  placeholder={'Nama'}
                  onChangeText={(teks) => this.setState({name: teks})}
                />
                <TextInput
                  style={styles.input}
                  value={this.state.transfer_to}
                  placeholder={'Rekening Tujuan'}
                  onChangeText={(teks) => this.setState({transfer_to: teks})}
                />
                <TextInput
                  style={styles.input}
                  value={this.state.transfer_date}
                  placeholder={'Tanggal Transfer'}
                  onChangeText={(teks) => this.setState({transfer_date: teks})}
                />
                <TextInput
                  style={styles.input}
                  value={this.state.amount}
                  placeholder={'Jumlah Transfer'}
                  onChangeText={(teks) => this.setState({amount: teks})}
                />
                <Text>Upload Bukti Transfer</Text>
                <TouchableOpacity onPress={() => this.takePic()}>
                  {this.state.bukti.uri ? (
                    <Image
                      source={{uri: this.state.bukti.uri}}
                      style={styles.profileImage}
                    />
                  ) : (
                    <IonIcons
                      name={'camera'}
                      size={80}
                      style={styles.profileIconDefault}
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => this.sendProof(this.state.id)}
                  style={styles.sendButton}>
                  <Text style={styles.sendText}>Kirim</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </Modal>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    padding: 10,
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: 'teal',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    padding: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    margin: 20,
  },
  sendText: {
    fontSize: 20,
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    margin: 3,
    borderRadius: 15,
    width: '100%',
  },
  profileIconDefault: {
    margin: 10,
    borderWidth: 1,
    padding: 25,
    borderRadius: 5,
  },
  profileImage: {
    borderRadius: 5,
    width: 130,
    height: 130,
  },
  reviewText: {
    fontSize: 17,
    margin: 5,
  },
  productReview: {
    width: '100%',
    backgroundColor: '#adadad',
    padding: 5,
    borderRadius: 5,
    elevation: 10,
    marginVertical: 10,
  },
  productContainer: {
    width: '100%',
    backgroundColor: '#adadad',
    padding: 5,
    borderRadius: 5,
    elevation: 10,
    flexDirection: 'row',
    marginVertical: 10,
  },
  ItemBoxText: {
    padding: 5,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 15,
  },
  trashIcon: {
    position: 'absolute',
    bottom: 3,
    right: 5,
  },
});
