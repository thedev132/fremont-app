import React, { useEffect } from 'react';
import { Image, StatusBar, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { Button, Provider as PaperProvider, DefaultTheme, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { getToken } from '@/hooks/ServerAuth/GoogleLoginHelper';
import { login } from '@/hooks/ServerAuth/ManuelLoginHelper';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  WebBrowser.maybeCompleteAuthSession();

  useEffect(() => {
    const handleDeepLink = (event) => {
      const parsedUrl = new URL(event.url);
      const state = decodeURIComponent(parsedUrl.searchParams.get('state'));
      const code = decodeURIComponent(parsedUrl.searchParams.get('code'));
      getToken(state, code);
      setLoading(true);
      navigation.navigate('auth/ConnectInfiniteCampus');
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => {
      subscription.remove();
    };
  }, []);

  const handleGoogleLoginPress = async () => {
    try {
      const response = await fetch('https://fremont-app.vercel.app/api/auth/o/google/?redirect_uri=https%3A%2F%2Ffremont-app.vercel.app%2Fredirect', { cache: "no-store" });
      const data = await response.json();
      const url = data["authorization_url"];
      console.log(url);
      let responseURL = await WebBrowser.openAuthSessionAsync(url)
      const parsedUrl = new URL(responseURL["url"]);
      const state = decodeURIComponent(parsedUrl.searchParams.get('state'));
      const code = decodeURIComponent(parsedUrl.searchParams.get('code'));
      getToken(state, code);
      navigation.navigate('auth/ConnectInfiniteCampus');
    } catch (error) {
      console.error("Error fetching state value:", error);
    }
  };

  const handleLoginPress = async () => {
    try {
      let response = await login(email, password);
      console.log(response)
      if (response == true) {
        // trigger a loading screen
        navigation.navigate('auth/ConnectInfiniteCampus');
      }
      else {
        alert("Invalid email or password");
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#BF1B1B' />
      </View>
    )
  }

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.innerContainer}>
            <Image
              style={styles.logo}
              source={require('../../assets/images/logo.png')}
            />
            <Text style={styles.title}>Fremont High School</Text>
            <Text style={styles.subtitle}>Home of the firebirds</Text>
            <View style={styles.inputContainer}>
              <TextInput
                mode='outlined'
                value={email}
                onChangeText={text => setEmail(text)}
                outlineStyle={{borderRadius: 15, backgroundColor: '#eee', shadowColor: '#000', borderColor: '#eee', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2}}
                style={styles.input}
                placeholder='Email'
                cursorColor='#BF1B1B'
                selectionColor='#BF1B1B'
                activeOutlineColor='#BF1B1B'
                autoCapitalize='none'
              />
              <TextInput
                mode='outlined'
                value={password}
                onChangeText={text => setPassword(text)}
                secureTextEntry={true}
                style={styles.input}
                placeholder='Password'
                outlineStyle={{borderRadius: 15, backgroundColor: '#eee', shadowColor: '#000', borderColor: '#eee', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2}}
                cursorColor='#BF1B1B'
                selectionColor='#BF1B1B'
                activeOutlineColor='#BF1B1B'
                autoCapitalize='none'
              />
              <TouchableOpacity onPress={handleLoginPress} style={styles.loginButton}>
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("auth/register")}>
                <Text style={styles.registerText}>Don't have an account?</Text>
              </TouchableOpacity>
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.divider} />
              </View>
              <TouchableOpacity onPress={handleGoogleLoginPress} style={styles.googleButton}>
                <Image source={require('../../assets/images/google.png')} />
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: height * 0.05,
  },
  innerContainer: {
    width: width * 0.8,
    alignItems: 'center',
  },
  logo: {
    marginBottom: height * 0.05,
    width: width * 0.5,
    height: height * 0.1,
    resizeMode: 'contain',
  },
  title: {
    color: '#000',
    fontSize: height * 0.04,
    marginTop: height * 0.02,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#000',
    fontSize: height * 0.025,
    marginTop: height * 0.01,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginTop: height * 0.03,
  },
  input: {
    marginBottom: height * 0.02,
    borderRadius: 15,
    backgroundColor: '#eee',
    shadowColor: '#000',
    borderColor: '#eee',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  loginButton: {
    backgroundColor: '#BF1B1B',
    padding: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.02,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: height * 0.025,
    fontWeight: 'bold',
  },
  registerText: {
    color: '#666',
    fontSize: height * 0.02,
    textAlign: 'center',
    marginBottom: height * 0.02,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  divider: {
    flex: 1,
    height: 2,
    backgroundColor: 'black',
  },
  dividerText: {
    width: 50,
    textAlign: 'center',
    fontSize: height * 0.03,
    fontWeight: '500',
  },
  googleButton: {
    backgroundColor: '#BF1B1B',
    padding: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: height * 0.02,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: height * 0.025,
    marginLeft: 10,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
