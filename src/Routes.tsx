import React from 'react';
// import { useSelector } from 'react-redux';
import { Navigate, Route, Routes as Switch } from 'react-router-dom';

import Home from 'domains/home';
import PrivateRoute from 'components/PrivateRoute';
import { ScrobbleSong } from './domains/scrobbleSong';
import {
  ScrobbleAlbumSearch,
  ScrobbleArtistResults,
  ScrobbleAlbumResults,
  ScrobbleAlbumTracklist,
} from 'domains/scrobbleAlbum';
import { ScrobbleUserSearch, ScrobbleUserResults } from './domains/scrobbleUser';

// import Spinner from 'components/Spinner';

export default function Routes() {
  // ToDo: fix this to avoid the eternal spinner of death
  // const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  // const settingsLoaded = useSelector((state) => state.settings.settingsLoaded);

  // if (isLoggedIn === null || (isLoggedIn && !settingsLoaded)) {
  //   // ToDo: use suspense
  //   return <Spinner />;
  // }

  return (
    <Switch>
      <Route path="/scrobble/song" element={<ScrobbleSong />} />
      <Route path="/scrobble/album" element={<PrivateRoute using={ScrobbleAlbumSearch} />} />
      <Route path="/scrobble/album/search/:albumName" element={<PrivateRoute using={ScrobbleAlbumResults} />} />
      <Route path="/scrobble/artist">
        <Route path=":artistName" element={<PrivateRoute using={ScrobbleArtistResults} />} />
        <Route path="mbid/:mbid" element={<PrivateRoute using={ScrobbleArtistResults} />} />
        <Route path="dsid/:discogsId" element={<PrivateRoute using={ScrobbleArtistResults} />} />
      </Route>
      <Route path="/scrobble/album/view">
        <Route path="mbid/:albumId" element={<PrivateRoute using={ScrobbleAlbumTracklist} />} />
        <Route path="dsid/:discogsId" element={<PrivateRoute using={ScrobbleAlbumTracklist} />} />
        <Route path=":artist/:albumName" element={<PrivateRoute using={ScrobbleAlbumTracklist} />} />
      </Route>
      <Route path="/scrobble/user" element={<PrivateRoute using={ScrobbleUserSearch} />} />
      <Route path="/scrobble/user/:username" element={<PrivateRoute using={ScrobbleUserResults} />} />

      <Route path="/" element={<Home />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Switch>
  );
}
