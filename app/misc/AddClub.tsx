import getAllOrganizations from "@/hooks/Organizations/getAllOrganizations";
import Organization from "@/hooks/Organizations/Organization";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import { View, Text, Dimensions, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { Card } from "react-native-paper";
import { FlatList } from 'react-native-gesture-handler';
import getUserMe from "@/hooks/Users/Users";
import NestedOrganization from "@/hooks/Posts/NestedOrganization";

export default function AddClubScreen({ navigation }) {
    const [clubs, setClubs] = useState<Organization[]>([]);
    const [myClubs, setMyClubs] = useState<NestedOrganization[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [noMoreData, setNoMoreData] = useState(false);
    const [allOrgs, setAllOrgs] = useState<Organization[]>([]); // Store all organizations here

    async function addClub(id: number, name: string, type: string) {
        // Add club to user's clubs
        // Update myClubs state
        // Update clubs state
        let accessToken = await AsyncStorage.getItem('accessToken');
        const response = await fetch(`https://fremont-app-backend.vercel.app/api/users/me/orgs/`, {
             "method": "POST",
             headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${accessToken}`, // Add this line for authorization
            },
            "body": `{\n    \"organization\": ${id}\n}`,
        });
        let data = await response.json();
        if (data["organization"] != null) {
            let newClub = new NestedOrganization(String(id), name, type);
            setMyClubs((prevClubs) => [...prevClubs, newClub]);
            setClubs((prevClubs) => prevClubs.filter(club => club.getId() !== String(id)));
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                let storedMyOrgs = await AsyncStorage.getItem('myOrgs');
                if (storedMyOrgs != null) {
                    let json = JSON.parse(storedMyOrgs);
                    setMyClubs(json.map((org: any) => new NestedOrganization(org.id, org.name, org.type)));
                }
                else {
                  let me = await getUserMe();
                  let myOrgs = me.getOrgs();
                  await AsyncStorage.setItem('myOrgs', JSON.stringify(myOrgs));
                  setMyClubs(myOrgs);
                }

                let storedOtherOrgs = await AsyncStorage.getItem('orgs');
                
                let orgs: Organization[] = [];
                if (storedOtherOrgs != null) {
                    let json = JSON.parse(storedOtherOrgs);
                    orgs = json.map((org: any) => new Organization(org.id, org.name, org.type, org.day, org.location, org.time, org.description));
                } else {
                    orgs = await getAllOrganizations(1);
                    await AsyncStorage.setItem('orgs', JSON.stringify(orgs));
                }
                setAllOrgs(orgs);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching organizations:', error);
                setLoading(false);
            }
        };

        const updateData = async () => {
            try {
                let me = await getUserMe();
                let myOrgs = me.getOrgs();
                await AsyncStorage.setItem('myOrgs', JSON.stringify(myOrgs));
                setMyClubs(myOrgs);
                let orgs: Organization[] = [];
                orgs = await getAllOrganizations(1);
                await AsyncStorage.setItem('orgs', JSON.stringify(orgs));
                setAllOrgs(orgs);
            } catch (error) {
                console.error('Error updating organizations:', error);
            }
        }
        fetchData();
        updateData();
    }, []);

    useEffect(() => {
        const filterClubs = () => {
            const myClubIds = new Set(myClubs.map(club => club.getId()));
            const filteredClubs = allOrgs.filter(club => !myClubIds.has(club.getId()));
            setClubs(filteredClubs);
        };
        filterClubs();
    }, [myClubs, allOrgs]);

    const loadMoreData = async () => {
        if (loadingMore || noMoreData) return;

        setLoadingMore(true);
        try {
            let newOrgs = await getAllOrganizations(page + 1);
            if (newOrgs.length === 0) {
                setNoMoreData(true);
            } else {
                setAllOrgs((prevOrgs) => [...prevOrgs, ...newOrgs]);
                setPage(prevPage => prevPage + 1);
            }
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'NOwrap' }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', flexShrink: 1}} numberOfLines={1}>{item.getName()}</Text>
                    <TouchableOpacity onPress={() => addClub(parseInt(item.getId()), item.getName(), item.getType())} style={{ marginLeft: 'auto', marginRight: 5 }}>
                          <MaterialIcons name="person-add" size={24} color="black" />
                        </TouchableOpacity>
                        <MaterialIcons name="arrow-forward-ios" size={20} color="black" />
                    </View>
                </TouchableOpacity>
            </Card>
        );
    };

    const myRenderItem = ({ item }: { item: NestedOrganization }) => {
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
                    id : item.getId(),
                    name: item.getName(),
                    description: "fetch",
                    day: "fetch",
                    time: "fetch",
                    location: "fetch"
                })}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'nowrap' }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', flexShrink: 1}} numberOfLines={1}>{item.getName()}</Text>
                        <TouchableOpacity style={{ marginLeft: 'auto', marginRight: 5 }}>
                            <MaterialIcons name="person-remove" size={24} color="black" />
                        </TouchableOpacity>
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
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 70, marginBottom: 10, textAlign: 'center' }}>My Clubs</Text>

                <FlatList
                    data={myClubs}
                    renderItem={myRenderItem}
                    keyExtractor={(item) => item.getId().toString()}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={true}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    style={{ flexGrow: 0, width: '100%' }}
                />

                <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>Other Clubs</Text>

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
    );
}
