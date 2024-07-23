import getAllOrganizations from "@/hooks/Organizations/getAllOrganizations";
import Organization from "@/hooks/Organizations/Organization";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React = require("react");
import { View, Text, Dimensions, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Card } from "react-native-paper";

export default function AddClubScreen({navigation}) {  

    const [clubs, setClubs] = React.useState<Organization[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
              setLoading(true);
              let storedOrgs = await AsyncStorage.getItem('orgs');
                if (storedOrgs != null) {
                    let json = JSON.parse(storedOrgs);
                    let orgs = json.map((org: any) => new Organization(org.id, org.name, org.type, org.day, org.location, org.time, org.description,));
                    setClubs(orgs);
                    setLoading(false);
                }
                else {
                    let orgs = await getAllOrganizations(1); // Assuming getAllOrganizations is an async function
                    setClubs(orgs);
                    setLoading(false);
                }
            } catch (error) {
              console.error('Error fetching organizations:', error);
            }
          };
        fetchData();
    }, []);
    
    const renderItem = ({ item }: { item: Organization }) => {
        const screenWidth = Dimensions.get('window').width; // Declare and assign the screenWidth variable
      
        return (
          <Card style={{
            marginVertical: 5,
            width: screenWidth - 50, // Ensuring card width fits within the screen with some margin
            alignSelf: 'center',
            padding: 15,
            borderRadius: 10,
            backgroundColor: 'white',
            elevation: 2, // For Android shadow
            shadowColor: '#000', // For iOS shadow
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.3,
            shadowRadius: 2,
          }}>
            <TouchableOpacity onPress={() => navigation.navigate('misc/ClubDetails', { name: item.getName(), description: item.getDescription(), day: item.getDay(), time: item.getTime(), location: item.getLocation() })}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.getName()}</Text>
                    <MaterialIcons name="person-add" size={24} color="black" style={{marginLeft: 'auto', marginRight: 5}}/>
                    <MaterialIcons name="arrow-forward-ios" size={20} color="black" />
              </View>
            </TouchableOpacity>
          </Card>
        );
      };

      if (loading) {
        return (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size='large' color='#BF1B1B'/>
          </View>
        )
      }



    return (
        <SafeAreaView style={{ alignItems: 'center', backgroundColor: '#f5f5f5' }}>
            <Text style={{fontSize: 24, fontWeight: 'bold', marginTop: 100, marginBottom: 10}}>Clubs</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{marginBottom: 20}} >
            {
                clubs.map((club, index) => {
                    return (
                        <View key={index}>
                            {renderItem({item: club})}
                        </View>
                    )
                })
            }
            </ScrollView>
            {/* add pagination next and previous buttons */}
            <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, marginBottom: 20}}>
                <TouchableOpacity>
                    <Text style={{fontSize: 16, color: '#BF1B1B'}}>Previous</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text style={{fontSize: 16, color: '#BF1B1B'}}>Next</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}