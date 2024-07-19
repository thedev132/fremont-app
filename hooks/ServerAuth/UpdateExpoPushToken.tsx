export default async function UpdateExpoPushToken(token) {
    const response = await fetch("/users/me/tokens/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: token }),
      });
    console.log(response);
}
