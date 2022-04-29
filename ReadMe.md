# Don't Fall - BackEnd Doc's

*Update Friday 29 April 2022*
## Changes:

- Added new Info-Route for Error-Codes
- Deleted "/test"-Route. There is no use anymore.
- Users & Guests get new Avatar-Images
- When a User signs up, the User recieves One Change for the Username
- Added Email-Validator
- Now a Guest can be upgraded to a User with all the Experience, Level, and Gold he earned as Guest
- Implemented Functions for Leveling.
- Added a mysterious Feature

## Route "/friends"
**POST "/request"**
> *Example: "/friends/request"*
- Expection: A RequestGiverID & RequestTargetID in the Body.
- Response: If Successful, you get Status 201 & `"Created new Request to RequestTargetID"`. Else you get an Error-Code (400 Invalid ID or 512 DB Query Fail)
> Request-Example:
> `axios.post("<APP_URL>/friends/request", {requestGiver: "123456789", requestTarget: "123417489"}).then((res) => console.log(res)).catch((err) => console.error(err))`

**POST "/accept"**
> *Example: "/friends/accept"*
- Expection: A RequestGiverID & RequestTargetID in the Body.
- Response: If Successful, you get Status 201 & `"Accepted Request from RequestTargetID"`. Else you get an Error-Code (400 Invalid ID or 512 DB Query Fail)
> Request-Example:
> `axios.post("<APP_URL>/friends/accept", {requestGiver: "123456789", requestTarget: "123417489"}).then((res) => console.log(res)).catch((err) => console.error(err))`

**POST "/decline"**
> *Example: "/friends/decline"*
- Expection: A RequestGiverID & RequestTargetID in the Body.
- Response: If Successful, you get Status 201 & `"Declined Request from RequestTargetID"`. Else you get an Error-Code (400 Invalid ID or 512 DB Query Fail)
> Request-Example:
> `axios.post("<APP_URL>/friends/decline", {requestGiver: "123456789", requestTarget: "123417489"}).then((res) => console.log(res)).catch((err) => console.error(err))`

## Route "/users"

 **GET "/:id"**

> *Example: "/users/62667b194b3052a298b127ad"*


- Expection: UserID
- Return Example:

> `	{
>     		"username": "aromaticMadella752",
>     "email": "test@test.de"
>     		"id": "62667b194b3052a298b127ad",
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

**GET "/multi/light**
> *Example: "/users/multi/light*
- Expection: An Array with ID's in the Body. There must be at least one ID
- Response: An Array with light Information about the UserID's in the Request
>Example:
>Request.body: 
>`['6266786fb7b9cadee0dc53d1', '6267a022e071fbb752006e07']`
>Response:
> `[
  {
    "username": "freezingBetteanne411",
    "id": "6266786fb7b9cadee0dc53d1",
    "currentSkin": "blue",
    "experience": 0,
    "level": 1,
    "isGuest": false
  },
  {
    "username": "sassyNoreen489",
    "id": "6267a022e071fbb752006e07",
    "currentSkin": "red",
    "experience": 0,
    "level": 1,
    "isGuest": true
  }
]`

**GET "/multi/medium**
> *Example: "/users/multi/medium*
- Expection: An Array with ID's in the Body. There must be at least one ID
- Response: An Array with medium Information about the UserID's in the Request
>Example:
>Request.body: 
>`['6266786fb7b9cadee0dc53d1', '6267a022e071fbb752006e07']`
>Response:
>`[
  {
    "username": "freezingBetteanne411",
    "id": "6266786fb7b9cadee0dc53d1",
    "currentSkin": "blue",
    "experience": 0,
    "level": 1,
    "isGuest": false,
    "email": "Uwe@test.de",
    "gold": 0,
    "skins": [
      "red",
      "blue",
      "black"
    ],
    "friends": []
  },
  {
    "username": "sassyNoreen489",
    "id": "6267a022e071fbb752006e07",
    "currentSkin": "red",
    "experience": 0,
    "level": 1,
    "isGuest": true,
    "email": "GUEST@GUEST.de",
    "gold": 0,
    "skins": [
      "red",
      "blue",
      "black"
    ],
    "friends": []
  }
]`


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

## Mysterious "cheat/"

**GET "/":**
*Example: "cheats/?gold=123"*
- Expection: A valid ID in the Body
- You have three possible Cheats: - Gold ("/?gold") - Level ("/?lvl") - Experience ("/?xp") The Body of your POST-Request must contain a valid ID. You only can do one Cheat. There is no Possibility for multiple Cheats at once! **If you succeed, you are a Cheater. Congrats!**
- Updates the User in the DB. Example:
>`axios.post("<URL>/cheat/?gold=123", {userID: "123"}, {withCredentials: true}).then(res => console.log(res));`


***
***
*Update Thursday 28 April 2022*
## Changes:
- GET "/:id":
> Returns now the Email of the User. Deleted the Token in the Response
- Added "/friends"-Route
- Added Multiple ID-Request:
> You can Request multiple UserID's. For this request you have the send an Array with ID's
- Modified Cookies:
> Cookies refresh now every hour. If your Cookie dosn't Refresh fo 90min, the Token will be expired.
- You have to set in every Route (except "/login", "/registration", "/info") `withCredentials: true`

## Route "/friends"
**POST "/request"**
> *Example: "/friends/request"*
- Expection: A RequestGiverID & RequestTargetID in the Body.
- Response: If Successful, you get Status 201 & `"Created new Request to RequestTargetID"`. Else you get an Error-Code (400 Invalid ID or 512 DB Query Fail)
> Request-Example:
> `axios.post("<APP_URL>/friends/request", {requestGiver: "123456789", requestTarget: "123417489"}).then((res) => console.log(res)).catch((err) => console.error(err))`

## Route "/users"

 **GET "/:id"**

> *Example: "/users/62667b194b3052a298b127ad"*


- Expection: UserID
- Return Example:

> `	{
>     		"username": "aromaticMadella752",
>     "email": "test@test.de"
>     		"id": "62667b194b3052a298b127ad",
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

**GET "/multi/light**
> *Example: "/users/multi/light*
- Expection: An Array with ID's in the Body. There must be at least one ID
- Response: An Array with light Information about the UserID's in the Request
>Example:
>Request.body: 
>`['6266786fb7b9cadee0dc53d1', '6267a022e071fbb752006e07']`
>Response:
> `[
  {
    "username": "freezingBetteanne411",
    "id": "6266786fb7b9cadee0dc53d1",
    "currentSkin": "blue",
    "experience": 0,
    "level": 1,
    "isGuest": false
  },
  {
    "username": "sassyNoreen489",
    "id": "6267a022e071fbb752006e07",
    "currentSkin": "red",
    "experience": 0,
    "level": 1,
    "isGuest": true
  }
]`

**GET "/multi/medium**
> *Example: "/users/multi/medium*
- Expection: An Array with ID's in the Body. There must be at least one ID
- Response: An Array with medium Information about the UserID's in the Request
>Example:
>Request.body: 
>`['6266786fb7b9cadee0dc53d1', '6267a022e071fbb752006e07']`
>Response:
>`[
  {
    "username": "freezingBetteanne411",
    "id": "6266786fb7b9cadee0dc53d1",
    "currentSkin": "blue",
    "experience": 0,
    "level": 1,
    "isGuest": false,
    "email": "Uwe@test.de",
    "gold": 0,
    "skins": [
      "red",
      "blue",
      "black"
    ],
    "friends": []
  },
  {
    "username": "sassyNoreen489",
    "id": "6267a022e071fbb752006e07",
    "currentSkin": "red",
    "experience": 0,
    "level": 1,
    "isGuest": true,
    "email": "GUEST@GUEST.de",
    "gold": 0,
    "skins": [
      "red",
      "blue",
      "black"
    ],
    "friends": []
  }
]`


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

*Update Wednesday 27 April 2022*
## Changes:
- Cookie Issues solved:
>To save the Cookie in the FrontEnd, you have to implement the following Code inside the Login-Fetch: `{ withCredentials: true }`. So your Fetch should look like this:
>`axios.post( 'http://https://dontfall-backend.herokuapp.com/users/login', {password: '123abc', email: 'test@test.de', }, { withCredentials: true }).then((res) =>  console.log(res));`
- Deployed the BackEnd. You can access the BackEnd with the following URL: https://dontfall-backend.herokuapp.com/

- CORS:
> Modified the allowed Origins, so only the FrontEnd can access the Routes. The following Routes are public (If you want access toall Routes mail me Kevin@KevinPoppe.com ) : 
>   - https://dontfall-backend.herokuapp.com/test
>   - https://dontfall-backend.herokuapp.com/info
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
