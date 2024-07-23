import getAllOrganizations from "@/hooks/Organizations/getAllOrganizations";
import Organization from "@/hooks/Organizations/Organization";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { View, Text, Dimensions, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { Card } from "react-native-paper";
import { FlatList } from 'react-native-gesture-handler'

export default function AddClubScreen({ navigation }) {
    const [clubs, setClubs] = React.useState<Organization[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [page, setPage] = React.useState(1);
    const [loadingMore, setLoadingMore] = React.useState(false);
    const [noMoreData, setNoMoreData] = React.useState(false);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                if (clubs.length == 0) {
                   setLoading(true);
                }
                let storedOrgs = await AsyncStorage.getItem('orgs');
                if (storedOrgs != null) {
                    let json = JSON.parse(storedOrgs);
                    let orgs = json.map((org: any) => new Organization(org.id, org.name, org.type, org.day, org.location, org.time, org.description));
                    setClubs(orgs);
                } else {
                    let orgs = await getAllOrganizations(page);
                    setClubs(orgs);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching organizations:', error);
            }
        };
        fetchData();
    }, [page]);

    const loadMoreData = async () => {
        if (loadingMore) return;
        if (noMoreData) return;
        
        setLoadingMore(true);
        try {
            let newOrgs = await getAllOrganizations(page + 1);
            console.log(newOrgs);
            setClubs((prevClubs) => [...prevClubs, ...newOrgs]);
            setPage(page + 1);
        } catch (error) {
            console.error('Error loading more organizations:', error);
            setNoMoreData(true);
        }
        setLoadingMore(false);
    };

    const renderItem = ({ item }: { item: Organization }) => {
        const screenWidth = Dimensions.get('window').width;

        return (
            <Card style={{
                marginVertical: 5,
                width: screenWidth - 50,
                alignSelf: 'center',
                padding: 15,
                borderRadius: 10,
                backgroundColor: 'white',
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
            }}>
                <TouchableOpacity onPress={() => navigation.navigate('misc/ClubDetails', {
                    name: item.getName(),
                    description: item.getDescription(),
                    day: item.getDay(),
                    time: item.getTime(),
                    location: item.getLocation()
                })}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.getName()}</Text>
                        <MaterialIcons name="person-add" size={24} color="black" style={{ marginLeft: 'auto', marginRight: 5 }} />
                        <MaterialIcons name="arrow-forward-ios" size={20} color="black" />
                    </View>
                </TouchableOpacity>
            </Card>
        );
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return <ActivityIndicator size='large' color='#BF1B1B' style={{ marginVertical: 20 }} />;
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size='large' color='#BF1B1B' />
            </View>
        )
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 50, marginBottom: 10, textAlign: 'center' }}>Clubs</Text>
                <FlatList
                    data={clubs}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.getId().toString()}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={true}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    style={{ flex: 1, width: '100%' }}
                    onEndReached={loadMoreData}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                />
            </View>
        </SafeAreaView>
    )
}
