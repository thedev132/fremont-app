import AsyncStorage from "@react-native-async-storage/async-storage";
import NestedOrganization from "./NestedOrganization";
import Post from "./Post";

export default async function getAllPosts(postsData: any) {
  console.log(postsData);
  let posts: Post[] = [];
  for (let post of postsData["results"]) {
    let organization = new NestedOrganization(
      post["organization"]["id"],
      post["organization"]["name"],
      post["organization"]["type"],
    );
    let newPost = new Post(
      post["id"],
      post["title"],
      post["content"],
      post["url"],
      post["date"],
      organization,
    );
    posts.push(newPost);
  }
  return posts;
}
