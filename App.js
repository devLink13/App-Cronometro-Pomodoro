import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, TextInput, Alert } from 'react-native';

import * as Notifications from 'expo-notifications';


let timer = null;
let ss = 0;
let mm = 0;
let hh = 0;
const intervaloTempo = 1000; // base de tempo pro cronometro



Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});


async function pedirPermissaoNotificacao() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Permissão para notificações foi negada!');
  } else {
    console.log('permissão concedida para notificações.');
  }
}


function App() {

  const [numero, setNumero] = useState('00:00:00');
  const [botao, setBotao] = useState('VAI');
  const [ultimo, setUltimo] = useState(null);
  const [pomodoro, setPomodoro] = useState(0);
  const [pomoOn, setPomoOn] = useState(false);



  function vai() {

    setUltimo('');

    if (timer !== null) {
      // se o timer estiver girando, devemos parar o timer
      clearInterval(timer);
      timer = null;
      setBotao('VAI');
    }
    else {
      // se o timer estiver nulo, então devemos girar o timer
      timer = setInterval(() => {
        ss++;

        if (ss === 60) {
          ss = 0;
          mm++;
        }

        if (mm === 60) {
          mm = 0;
          hh++;
        }

        let format =  // formatar a string que apresentará o valor do tempo
          (hh < 10 ? ('0' + hh) : hh) + ':' +
          (mm < 10 ? ('0' + mm) : mm) + ':' +
          (ss < 10 ? ('0' + ss) : ss);


        setNumero(format);

      }, intervaloTempo); // chamar a função a cada 100ms

      setBotao('PARAR');
    }

  }

  function limpar() {

    if (timer !== null) { //se o timer estiver girando, parar o timer
      clearInterval(timer);
      timer = null;
    }

    if (numero === '00:00:00') {
      return;
    }

    setUltimo(numero); // seta o ultimo valor do timer
    setNumero('00:00:00');
    ss = 0;
    mm = 0;
    hh = 0;
    setBotao('VAI');

  }

  function alertaTempo(tempo) {
    const pomodoro = Number(tempo);
    console.log(pomodoro);

    if (isNaN(pomodoro) || pomodoro > 60 || pomodoro <= 0) {
      alert('Tempo Inválido.');
    } else {

      Alert.alert(
        'Confirmar Pomodoro',
        `Voce deseja iniciar um pomodoro de ${pomodoro} minutos?`,
        [
          {
            text: 'Sim',
            onPress: () => {
              console.log('pomodoro confirmado.');
              setPomodoro(pomodoro);
              setPomoOn(true);
            }
          },
          {
            text: 'Zerar e iniciar',
            onPress: () => {
              limpar();
              vai();
              setPomoOn(true);
              setPomodoro(pomodoro);

            },
            style: 'default'
          },
          {
            text: 'Cancelar',
            onPress: () => {
              console.log('pomodoro cancelado');
              return;
            }
          }

        ]
      )
    }
  }


  useEffect(() => {
    pedirPermissaoNotificacao();
  }, []);

  useEffect(() => {
    // vericar se o timer é igual ao pomodoro setado

    if (pomodoro > 0) {
      const [hhTimer, mmTimer, ssTimer] = numero.split(':').map(Number);


      if (pomodoro === mmTimer) {
        console.log('disparando notificação...')
        Notifications.scheduleNotificationAsync({
          content: {
            title: 'Pomodoro Finalizado!',
            body: 'O tempo do pomodoro foi atingido. Dê uma pausa.',
            sound: true,
          },
          trigger: null,
        });
        limpar();
      }
    }

  }, [numero]);

  function cancelarPomodoro() {
    Alert.alert(
      'Cancelar Pomodoro',
      `Voce deseja o pomodoro atual?`,
      [
        {
          text: 'Zerar e Cancelar',
          onPress: () => {
            console.log('pomodoro cancelado e zerado.');
            limpar(); // zera o timer
            setPomodoro(0); // zera o pomodoro
            setPomoOn(false); // sinaliza desligamento do pomodoro
          }
        },
        {
          text: 'Sim',
          onPress: () => {
            console.log('pomodoro cancelado.');
            setPomodoro(0);
            setPomoOn(false);
            vai(); // chamar a funcao vai com o cronometro em funcionamento pausa ele

          },
          style: 'default'
        },
        {
          text: 'Cancelar',
          onPress: () => {
            console.log('voltou atras no cancelamento');
            return;
          }
        }

      ]
    )
  }

  return (
    <SafeAreaView style={styles.container}>

      <View style={[styles.inputTime, pomoOn ? { borderWidth: 0 } : { borderWidth: 1 }]}>
        {
          pomoOn // SE O POMO ESTIVER OFF APARECE O VALOR DO POMODORO NA TELA, SE NÃO ENTÃO MOSTRA O INPUT DE SELECIONAR
            ? (
              <>
                <Text style={{ fontSize: 20, textAlign: 'center', color: 'green', fontWeight: 'bold' }}>POMODORO ATIVADO PARA {pomodoro} MINUTOS.</Text>
                <TouchableOpacity
                  style={styles.btnCancelar}

                  onPress={cancelarPomodoro}

                >
                  <Text style={styles.btnCancelarTxt}>CANCELAR</Text>
                </TouchableOpacity>
              </>
            )

            : <TextInput
              style={styles.inputTxt}
              onSubmitEditing={(event) => alertaTempo(event.nativeEvent.text)} // captura o texto digitado
              placeholder='Digite um pomodoro de até 60 minutos.'
              placeholderTextColor="#fff"
              keyboardType='number-pad'
            />

        }
      </View>

      <Image
        source={require('./src/img/crono.png')}
      />
      <Text style={styles.timer}>{numero}</Text>

      <View style={styles.btnArea}>

        <TouchableOpacity style={styles.btn} onPress={vai}>
          <Text style={styles.btnText}>{botao}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={limpar}>
          <Text style={styles.btnText}>LIMPAR</Text>
        </TouchableOpacity>

      </View>

      <View style={styles.ultimoTempo}>
        <Text style={styles.txtTempo}>
          {ultimo ? ('ultimo tempo: ' + ultimo) : ''}
        </Text>
      </View>

    </SafeAreaView>

  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00aeef',
    alignItems: 'center',
    justifyContent: 'center'

  },
  timer: {
    marginTop: -160,
    fontSize: 45,
    fontWeight: 'bold',
    color: '#fff'
  },
  btnArea: {
    flexDirection: 'row',
    marginTop: 130,
    height: 40
  },
  btn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 40,
    margin: 17,
    borderRadius: 9
  },
  btnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00aeef'
  },
  ultimoTempo: {
    marginTop: 45,

  },
  txtTempo: {
    fontSize: 25,
    color: '#fff',
    fontStyle: 'italic'
  },

  inputTime: {
    width: '60%',
    height: 60,
    marginBottom: 100,
    borderWidth: 1,
    borderColor: '#fff',
    justifyContent: 'center', // Centraliza verticalmente
    alignItems: 'center', // Centraliza horizontalmente
  },

  inputTxt: {
    textAlign: 'center',
    paddingVertical: 0,
    height: '100%',
    fontSize: 20,
    color: '#fff'
  },
  btnCancelar: {
    borderWidth: 1,
    borderColor: '#fff',
    height: 40,
    width: 130,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#fff'
  },
  btnCancelarTxt: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold'
  }


})