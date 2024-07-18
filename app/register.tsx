import React from "react"
import { TouchableOpacity, View, Text} from "react-native"


export default function Register({navigation}) {
    return (
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <TextInput
                      mode='outlined'
                      value={email}
                      onChangeText={text => setEmail(text)}
                      outlineStyle={{borderRadius: 15, backgroundColor: '#eee', shadowColor: '#000', borderColor: '#eee', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2}}
                      style={{marginBottom: 10}}
                      placeholder='Email'
                      cursorColor='#BF1B1B'
                      selectionColor='#BF1B1B'
                />
                <TextInput
                      mode='outlined'
                      value={password}
                      onChangeText={text => setPassword(text)}
                      secureTextEntry={true}
                      outlineStyle={{borderRadius: 15, backgroundColor: '#eee', shadowColor: '#000', borderColor: '#eee', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2}}
                      style={{marginBottom: 10}}
                      placeholder='Password'
                      cursorColor='#BF1B1B'
                      selectionColor='#BF1B1B'

                />
        </View>
    )
}