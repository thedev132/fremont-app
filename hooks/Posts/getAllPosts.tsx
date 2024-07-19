import AsyncStorage from "@react-native-async-storage/async-storage";
import Organization from "./Organization";
import Post from "./Post";

export default async function getAllPosts() {
    let accessToken = await AsyncStorage.getItem('accessToken');
    const response = await fetch("https://fremont-app-backend.vercel.app/api/posts/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`, // Add this line for authorization
        },
    });
    const data = await response.json();
    let posts: Post[] = [];
    for (let post of data['results']) {
        let organization = new Organization(post['organization']['id'], post['organization']['name'], post['organization']['type']);
        let newPost = new Post(post['id'], post['title'], post['content'], post['url'], post['date'], organization);
        posts.push(newPost);
    }
    return posts;
    
}