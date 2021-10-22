# Spotify-Music-Quiz
A Kahoot-esque API using Node.js, JS/TS Express, Mongo, Socket.io and the Spotify API.

# ENDPOINTS
  ## For rooms
    POST /init_new_room
      Needs playlist URI, user ID and a spotify access token in body
       
    POST /remove_player
      Needs user ID and room ID
      
    POST /add_player
      Needs user ID and room ID
      
    GET /get_room/:id
      
    GET /delete_room/:id
    
    POST /update_room
      Types of updates:
        [Increment room] Updates the room's track object.
          Needs: Room ID.
        
        [Pause] Changes the 'state' of the room and should emit state change to all sockets.
          Needs: Room ID and value should be progress_ms.
          
        [Unpause]. Changes the 'state' of the room and should emit state change to all sockets.
          Needs: Room ID.
    
  ## For users
    POST /add_user
      Needs username and ID. Just inits a user object in Mongo.
      
    GET /get_user/:id
    
    GET /logged_in/:data
      Fills the initilized user object in Mongo with data.
      Is a redirect from the Spotify oAuth, gets:
        Access token,
        Refresh token,
        Id,
        Username
        
    POST /update_user
      Types of updates: ['delete', 'login', 'join_room', 'correct_guess', 'incorrect_guess', 'rooms_won', 'rooms_lost', 'new_badge', 'socket_change'];
  
  ## For playlists
    GET /get_recommended
    
    POST /save_recommended
      Needs Spotify Playlist URI and Access token.
    
