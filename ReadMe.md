# Don't Fall - BackEnd Doc's
*Update Wednesday 27 April 2022*
## Changes:
- Cookie Issues solved:
>To save the Cookie in the FrontEnd, you have to implement the following Code inside the Login-Fetch: `{ withCredentials: true }`. So your Fetch should look like this:
>`axios.post( 'http://https://dontfall-backend.herokuapp.com/users/login', {password: '123abc', email: 'test@test.de', }, { withCredentials: true }).then((res) =>  console.log(res));`
- Deployed the BackEnd. You can access the BackEnd with the following URL: https://dontfall-backend.herokuapp.com/

- CORS:
> Modified the allowed Origins, so only the FrontEnd can access the Routes. The following Routes are public (If you want access toall Routes mail me Kevin@KevinPoppe.com ) : 
   - https://dontfall-backend.herokuapp.com/test
   - https://dontfall-backend.herokuapp.com/info
 - The POST "/setonline"-Route is no more avaible:
 > Users get automatically setted online when they connect with the Socket. This should happen directly after the Login. Also the Users get logged out, as soon as they disconnect from the Socket.
 - Modified the User-Schema:
 > Extended the Schema with a socketID & currentRoom Key. They change automatically, as soon as the User joins a Room or Connects to the Socket
## Route "/users"

 **GET "/:id"**

> *Example: "/users/62667b194b3052a298b127ad"*


- Expection: UserID
- Return Example:

> `	{
>     		"username": "aromaticMadella752",
>     		"id": "62667b194b3052a298b127ad", "token":"eyJhbGc...SM3XQKBAmOzZ2_9Aw",
>     		"currentSkin": "black",
>     		"experience": 0,
>     		"gold": 0,
>     		"level": 1,
>     	    "skins": [ 
>     		    "red", 
>     		    "blue", 
>     		    "black" 
>     	    ], 
>     	   "friends": [], 
>     	   "friendRequestsIncoming": [], 
>     	   "friendRequestsOutgoing": [], 
>     	   "isGuest": false 
>        }`

- Return with bad ID: `"Error: ID invalid!"`


**POST "/update"**

> *Example: "/users/update"*

- Expection: `body = {id: <userID>}`
- Optional: `body = {newUser, newPassword, newSkin, newEmail, oldPassword}`
- `newUser`: Must have valid UserID & new Username in Body
- `newPassword`: Must have valid UserID, valid old Password, new Password
- `newEmail`: Must have valid UserID, valid old Password, new Email
- `newSkin`: Must have valid UserID & new Skin as String (e.g. "red")
- Response: "Success"


**GET "/delte?id="**

> *Example: "users/delete?id=62667b194b3052a298b127ad"*

- Expection: UserID in Query
- Return: `true` at success or `false` if not successfull


**POST "/registration"**

> *Example: "/users/registration"*

- Expection: `body = {password, email}`
- Return: `"Success"`


**POST /login**

> *Example: "/users/login"*

- Expection: Must have `body = {isGuest: true || false}`
- Optional: `body = {email, password}`

>If `isGuest === true`, it creates a new User with standard-Password & Email (because they are requiered by the DB). Else if Guest is false, Email and Password are requiered!

- Returnexample (also returns a httpCookie) :

> `	{
>     		"username": "aromaticMadella752",
>     		"id": "62667b194b3052a298b127ad", "token":"eyJhbGc...SM3XQKBAmOzZ2_9Aw",
>     		"currentSkin": "black",
>     		"experience": 0,
>     		"gold": 0,
>     		"level": 1,
>     	    "skins": [ 
>     		    "red", 
>     		    "blue", 
>     		    "black" 
>     	    ], 
>     	   "friends": [], 
>     	   "friendRequestsIncoming": [], 
>     	   "friendRequestsOutgoing": [], 
>     	   "isGuest": true || false (Depending on the isGuest-Boolean)
>        }`


>    Usernames are random Generated. They are created as follows:
>     
>     function generateName() {
>       const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
>       const name = names[Math.floor(Math.random() * names.length)];
>       const number = Math.floor(Math.random() * 1000);
>     
>       const result = adjective + name + number.toString();
>     
>       return result;
>     }
>     
>     They are build like this: Adejective + Name + RandomNumber ( Value between 0-999 )

    




## Route "/game"

**Route "/"**
>*Example: "/game/"*
 - Options in Body:

>  difficulty: easy || medium || hard 
>  type: mutliple || boolean (If empty: mutliple) 
>  amount: 1 - 50 (If empty: 10) 
>  category: One of all Categories as String (Request /categories to see Options)
- Return an Array with Objects of Questions. Example:
> 
>     [
>      {
>       "category": "Sports",
>       "type": "multiple",
>       "difficulty": "hard",
>       "question": "How many times did Martina Navratilova win the Wimbledon Singles Championship?",
>       "correct_answer": "Nine",
>       "incorrect_answers": [
>        "Ten",
>        "Seven",
>        "Eight"
>       ]
>      },
>      {
>       "category": "History",
>       "type": "multiple",
>       "difficulty": "medium",
>       "question": "Which of the following ancient Near Eastern peoples still exists as a modern ethnic group?",
>       "correct_answer": "Assyrians",
>       "incorrect_answers": [
>        "Babylonians",
>        "Hittites",
>        "Elamites"
>       ]
>      }
>     ]

**GET "/categories"**

>*Example: "/users/categories"*
- Return: Array with all possible Categorgies




***
***
*Update Tuesday 26 April 2022*
## Route "/users"

 **GET "/:id"**

> *Example: "/users/62667b194b3052a298b127ad"*


- Expection: UserID
- Return Example:

> `	{
>     		"username": "aromaticMadella752",
>     		"id": "62667b194b3052a298b127ad", "token":"eyJhbGc...SM3XQKBAmOzZ2_9Aw",
>     		"currentSkin": "black",
>     		"experience": 0,
>     		"gold": 0,
>     		"level": 1,
>     	    "skins": [ 
>     		    "red", 
>     		    "blue", 
>     		    "black" 
>     	    ], 
>     	   "friends": [], 
>     	   "friendRequestsIncoming": [], 
>     	   "friendRequestsOutgoing": [], 
>     	   "isGuest": false 
>        }`

- Return with bad ID: `"Error: ID invalid!"`


**POST "/update"**

> *Example: "/users/update"*

- Expection: `body = {id: <userID>}`
- Optional: `body = {newUser, newPassword, newSkin, newEmail, oldPassword}`
- `newUser`: Must have valid UserID & new Username in Body
- `newPassword`: Must have valid UserID, valid old Password, new Password
- `newEmail`: Must have valid UserID, valid old Password, new Email
- `newSkin`: Must have valid UserID & new Skin as String (e.g. "red")
- Response: "Success"


**GET "/delte?id="**

> *Example: "users/delete?id=62667b194b3052a298b127ad"*

- Expection: UserID in Query
- Return: `true` at success or `false` if not successfull


**POST "/registration"**

> *Example: "/users/registration"*

- Expection: `body = {password, email}`
- Return: `"Success"`


**POST /login**

> *Example: "/users/login"*

- Expection: Must have `body = {isGuest: true || false}`
- Optional: `body = {email, password}`

>If `isGuest === true`, it creates a new User with standard-Password & Email (because they are requiered by the DB). Else if Guest is false, Email and Password are requiered!

- Returnexample (also returns a httpCookie) :

> `	{
>     		"username": "aromaticMadella752",
>     		"id": "62667b194b3052a298b127ad", "token":"eyJhbGc...SM3XQKBAmOzZ2_9Aw",
>     		"currentSkin": "black",
>     		"experience": 0,
>     		"gold": 0,
>     		"level": 1,
>     	    "skins": [ 
>     		    "red", 
>     		    "blue", 
>     		    "black" 
>     	    ], 
>     	   "friends": [], 
>     	   "friendRequestsIncoming": [], 
>     	   "friendRequestsOutgoing": [], 
>     	   "isGuest": true || false (Depending on the isGuest-Boolean)
>        }`

**POST "/setonline"**
>*Example: "/users/setonline"*
- Expection: `body = {userID, socketID, online: true || false (Is User coming Online = true or Leaving = false?)}`
- Changing the Collection currentlyonlines & the isOnline-Value in the users-Collection
- Response: `"Logged In"` || `"Logged Out"`


>    Usernames are random Generated. They are created as follows:
>     
>     function generateName() {
>       const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
>       const name = names[Math.floor(Math.random() * names.length)];
>       const number = Math.floor(Math.random() * 1000);
>     
>       const result = adjective + name + number.toString();
>     
>       return result;
>     }
>     
>     They are build like this: Adejective + Name + RandomNumber ( Value between 0-999 )

    




## Route "/game"

**Route "/"**
*Example: "/game/"*
 - Options in Body:

>  difficulty: easy || medium || hard 
>  type: mutliple || boolean (If empty: mutliple) 
>  amount: 1 - 50 (If empty: 10) 
>  category: One of all Categories as String (Request /categories to see Options)
- Return an Array with Objects of Questions. Example:
> 
>     [
>      {
>       "category": "Sports",
>       "type": "multiple",
>       "difficulty": "hard",
>       "question": "How many times did Martina Navratilova win the Wimbledon Singles Championship?",
>       "correct_answer": "Nine",
>       "incorrect_answers": [
>        "Ten",
>        "Seven",
>        "Eight"
>       ]
>      },
>      {
>       "category": "History",
>       "type": "multiple",
>       "difficulty": "medium",
>       "question": "Which of the following ancient Near Eastern peoples still exists as a modern ethnic group?",
>       "correct_answer": "Assyrians",
>       "incorrect_answers": [
>        "Babylonians",
>        "Hittites",
>        "Elamites"
>       ]
>      }
>     ]

**GET "/categories"**
*Example: "/users/categories"*
- Return: Array with all possible Categorgies
## Changes:
- Token in Header.Authorization is no more required:
> When an User or a Guest logs in, the BackEnd genereates an httpCookie. That Cookie is signed and secure and contains a JWT. For each Route, excepting "/login" & "/registration", the Cookie will be checked by JWT.
- Users can connect to the Socket:
> Each Dis-/Connect triggers the "/setonline"-Route. This means, that the "currentlyonlines"-Collection will be updatet in Realtime.
- Chat-Messages are now a Broadcast:
> A Message sended from a Client will be redirected to all other Client´s, excepting the sending Client.

***
***


*Update Monday 25 April 2022*

## Route "/users"

 **GET "/:id"**

> *Example: "/users/62667b194b3052a298b127ad"*


- Expection: UserID, Token in Header.Authorization
- Return Example:

> `	{
>     		"username": "aromaticMadella752",
>     		"id": "62667b194b3052a298b127ad", "token":"eyJhbGc...SM3XQKBAmOzZ2_9Aw",
>     		"currentSkin": "black",
>     		"experience": 0,
>     		"gold": 0,
>     		"level": 1,
>     	    "skins": [ 
>     		    "red", 
>     		    "blue", 
>     		    "black" 
>     	    ], 
>     	   "friends": [], 
>     	   "friendRequestsIncoming": [], 
>     	   "friendRequestsOutgoing": [], 
>     	   "isGuest": false 
>        }`

- Return with bad ID: `"Error: ID invalid!"`


**POST "/update"**

> *Example: "/users/update"*

- Expection: Token in Header.Authorization, `body = {id: <userID>}`
- Optional: `body = {newUser, newPassword, newSkin, newEmail, oldPassword}`
- `newUser`: Must have valid UserID & new Username in Body
- `newPassword`: Must have valid UserID, valid old Password, new Password
- `newEmail`: Must have valid UserID, valid old Password, new Email
- `newSkin`: Must have valid UserID & new Skin as String (e.g. "red")
- Response: "Success"


**GET "/delte?id="**

> *Example: "users/delete?id=62667b194b3052a298b127ad"*

- Expection: UserID in Query, Token in Header.Authorization
- Return: `true` at success or `false` if not successfull


**POST "/registration"**

> *Example: "/users/registration"*

- Expection: `body = {password, email}`
- Return: `"Success"`


**POST /login**

> *Example: "/users/login"*

- Expection: Must have `body = {isGuest: true || false}`
- Optional: `body = {email, password}`

>If `isGuest === true`, it creates a new User with standard-Password & Email (because they are requiered by the DB). Else if Guest is false, Email and Password are requiered!

- Returnexample:

> `	{
>     		"username": "aromaticMadella752",
>     		"id": "62667b194b3052a298b127ad", "token":"eyJhbGc...SM3XQKBAmOzZ2_9Aw",
>     		"currentSkin": "black",
>     		"experience": 0,
>     		"gold": 0,
>     		"level": 1,
>     	    "skins": [ 
>     		    "red", 
>     		    "blue", 
>     		    "black" 
>     	    ], 
>     	   "friends": [], 
>     	   "friendRequestsIncoming": [], 
>     	   "friendRequestsOutgoing": [], 
>     	   "isGuest": true || false (Depending on the isGuest-Boolean)
>        }`

**POST "/setonline"**
>*Example: "/users/setonline"*
- Expection: `body = {userID, socketID, online: true || false (Is User coming Online = true or Leaving = false?)}` & Token in Header.Authorization
- Changing the Collection currentlyonlines & the isOnline-Value in the users-Collection
- Response: `"Logged In"` || `"Logged Out"`


>    Usernames are random Generated. They are created as follows:
>     
>     function generateName() {
>       const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
>       const name = names[Math.floor(Math.random() * names.length)];
>       const number = Math.floor(Math.random() * 1000);
>     
>       const result = adjective + name + number.toString();
>     
>       return result;
>     }
>     
>     They are build like this: Adejective + Name + RandomNumber ( Value between 0-999 )

    




## Route "/game"

**Route "/"**
*Example: "/game/"*
- Expection: Token in Header.Authorization
 - Options in Body:

>  difficulty: easy || medium || hard 
>  type: mutliple || boolean (If empty: mutliple) 
>  amount: 1 - 50 (If empty: 10) 
>  category: One of all Categories as String (Request /categories to see Options)
- Return an Array with Objects of Questions. Example:
> 
>     [
>      {
>       "category": "Sports",
>       "type": "multiple",
>       "difficulty": "hard",
>       "question": "How many times did Martina Navratilova win the Wimbledon Singles Championship?",
>       "correct_answer": "Nine",
>       "incorrect_answers": [
>        "Ten",
>        "Seven",
>        "Eight"
>       ]
>      },
>      {
>       "category": "History",
>       "type": "multiple",
>       "difficulty": "medium",
>       "question": "Which of the following ancient Near Eastern peoples still exists as a modern ethnic group?",
>       "correct_answer": "Assyrians",
>       "incorrect_answers": [
>        "Babylonians",
>        "Hittites",
>        "Elamites"
>       ]
>      }
>     ]

**GET "/categories"**
*Example: "/users/categories"*
- Expection: Token in Header.Authorization
- Return: Array with all possible Categorgies
