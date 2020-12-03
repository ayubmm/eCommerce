/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  ToastAndroid,
} from 'react-native';
import CurrencyFormat from 'react-currency-format';
import IonIcons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Picker} from '@react-native-picker/picker';
import Chat from '../chat/eachChat';

export default class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      jumlah_pesan: '1',
      modalPesan: false,
      modalChat: false,
      arrStock: this.Looped_Stock(),
    };
  }

  Looped_Stock = () => {
    let stockArr = [];
    for (var i = 1; i <= this.props.product.stock; i += 1) {
      stockArr.push(i.toString());
    }
    return stockArr;
  };

  order() {
    console.log('ini product id == ', this.props.product.id);

    let endpoint = `https://tokonline.herokuapp.com/api/order/${this.props.product.id}`;

    AsyncStorage.getItem('token')
      .then((token) => {
        console.log('mulai fetch');
        let form = new FormData();

        form.append('jumlah_pesan', parseFloat(this.state.jumlah_pesan));
        console.log('ini form order ', form);

        fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        })
          .then((res) => res.json())
          .then((resJson) => {
            console.log(resJson);
            if (resJson.status === 'Success') {
              this.setState({modalPesan: false});
              ToastAndroid.show('Pesanan berhasil ditambah', 4000);
            }
          })
          .catch((err) => console.log('dari fetch', err));
      })
      .catch((err) => console.log('dari AsyncStorage', err));
  }

  render() {
    const {
      name,
      price,
      image,
      description,
      weight,
      stock,
      customer_id,
    } = this.props.product;
    return (
      <View>
        {/* ---Modal untuk Chat */}
        <Modal
          animationType={'slide'}
          visible={this.state.modalChat}
          onRequestClose={() => this.setState({modalChat: false})}>
          <Chat id_seller={customer_id} />
        </Modal>
        {/* ---Modal untuk Pesan */}
        <Modal
          animationType={'slide'}
          visible={this.state.modalPesan}
          onRequestClose={() => this.setState({modalPesan: false})}
          transparent={true}>
          <>
            <TouchableOpacity
              style={styles.modalBack}
              onPress={() => this.setState({modalPesan: false})}
            />
            <View style={styles.modalOrder}>
              <Text>Jumlah Pesan</Text>
              <Picker
                mode={'dropdown'}
                selectedValue={this.state.jumlah_pesan}
                style={styles.picker}
                onValueChange={(itemValue) =>
                  this.setState({jumlah_pesan: itemValue})
                }>
                {this.state.arrStock.map((item, index) => {
                  return <Picker.Item label={item} value={item} key={index} />;
                })}
              </Picker>
              <TouchableOpacity
                onPress={() => this.order()}
                style={styles.orderButton}>
                <Text style={styles.orderText}>Pesan</Text>
              </TouchableOpacity>
            </View>
          </>
        </Modal>

        {/* ---Modal untuk Gambar */}
        <Modal
          animationType={'fade'}
          visible={this.state.modal}
          onRequestClose={() => this.setState({modal: !this.state.modal})}>
          <View style={[styles.container, {backgroundColor: 'black'}]}>
            <Image source={{uri: image}} style={styles.modalImage} />
            <IonIcons
              size={30}
              name={'md-arrow-undo-sharp'}
              style={styles.backButton}
              onPress={() => this.setState({modal: !this.state.modal})}
              color={'#fffffff7'}
            />
          </View>
        </Modal>
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.imageCont}
            onPress={() => this.setState({modal: !this.state.modal})}>
            <Image source={{uri: image}} style={styles.image} />
          </TouchableOpacity>
          <View style={styles.productInfo}>
            <View style={styles.productHead}>
              <View>
                <CurrencyFormat
                  value={price}
                  displayType={'text'}
                  thousandSeparator={'.'}
                  decimalSeparator={','}
                  prefix={'Rp.'}
                  renderText={(value) => (
                    <Text style={styles.productPrice}>{value}</Text>
                  )}
                />

                <Text style={styles.productName}>{name}</Text>
                <Text style={styles.productStockWeight}>Stok: {stock}</Text>
                <CurrencyFormat
                  value={weight}
                  displayType={'text'}
                  thousandSeparator={'.'}
                  decimalSeparator={','}
                  suffix={' gram'}
                  renderText={(value) => (
                    <Text style={styles.productStockWeight}>
                      Berat: {value}
                    </Text>
                  )}
                />
              </View>
              <View>
                <TouchableOpacity style={styles.cartButton}>
                  <IonIcons
                    name={'cart'}
                    size={35}
                    onPress={() => this.setState({modalPesan: true})}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.chatButton}>
                  <IonIcons
                    name={'chatbox'}
                    size={35}
                    onPress={() => this.setState({modalChat: true})}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.productDescTitle}>Deskripsi Produk</Text>
            <Text style={styles.productDesc}>{description}</Text>
          </View>
        </ScrollView>
        <IonIcons
          size={30}
          name={'md-arrow-undo-sharp'}
          style={styles.backButton}
          onPress={() => this.props.close()}
          color={'#fffffff7'}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    width: 100,
  },
  modalOrder: {
    bottom: 0,
    width: '100%',
    padding: 25,
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  modalBack: {
    flex: 1,
    backgroundColor: '#808080b8',
  },
  orderText: {
    color: 'white',
    fontSize: 17,
  },
  orderButton: {
    backgroundColor: 'teal',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 10,
    margin: 20,
  },
  cartButton: {
    position: 'absolute',
    right: 5,
  },
  chatButton: {
    position: 'absolute',
    right: 5,
    bottom: 0,
  },
  productInfo: {
    padding: 20,
    width: '100%',
  },
  productHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  image: {
    width: '100%',
    height: 300,
  },
  productPrice: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'navy',
  },
  productName: {
    fontSize: 23,
    fontWeight: 'bold',
  },
  productDescTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    width: '100%',
    backgroundColor: '#eee',
    marginVertical: 15,
    textAlign: 'center',
    padding: 10,
  },
  productDesc: {
    fontSize: 16,
    textAlign: 'auto',
    marginVertical: 10,
  },
  productStockWeight: {
    fontSize: 15,
  },
  backButton: {
    position: 'absolute',
    backgroundColor: '#808080ba',
    left: 15,
    top: 10,
    borderRadius: 50,
    padding: 15,
    elevation: 10,
  },
  modalImage: {
    width: '100%',
    height: '70%',
    resizeMode: 'contain',
  },
  imageCont: {
    width: '100%',
  },
});
