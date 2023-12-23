import { useState, createContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Trans } from 'react-i18next';
import ReactGA from 'react-ga-neo';

import { Badge, Button, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCompactDisc, faHistory, faUserAstronaut } from '@fortawesome/free-solid-svg-icons';
import { faPlayCircle, faTrashAlt } from '@fortawesome/free-regular-svg-icons';

import type { RootState } from 'store';
import { clearListOfScrobbles, scrobbleCounterEnabled } from 'store/actions/scrobbleActions';

import ScrobbleList from 'components/ScrobbleList';
import { SongForm } from './SongForm';
import EmptyScrobbleListFiller from 'components/EmptyScrobbleListFiller';

import { LastFmProfileHistory } from './partials/LastFmProfileHistory';
import { useQueryClient } from '@tanstack/react-query';

import type { FC } from 'react';
import { useUserData } from 'hooks/useUserData';

type SidebarTab = 'history' | 'userProfile';

export const ScrobbleCloneContext = createContext({
  cloneFn: () => {},
  setCloneFn: undefined,
});

export const ScrobbleSong: FC = () => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('history');
  const [cloneReceiver, setCloneReceiver] = useState(undefined);
  const localScrobbles = useSelector((state: RootState) => state.scrobbles.list);
  const unreadScrobbles = useSelector((state: RootState) => state.scrobbles.unreadCount);
  const { user } = useUserData();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const goToHistoryTab = () => {
    if (activeTab !== 'history') {
      dispatch(scrobbleCounterEnabled(false));
      setActiveTab('history');
      ReactGA.event({
        category: 'Tabs',
        action: 'History',
      });
    }
  };

  const goToProfileTab = () => {
    if (activeTab !== 'userProfile') {
      dispatch(scrobbleCounterEnabled(true));
      setActiveTab('userProfile');
      ReactGA.event({
        category: 'Tabs',
        action: 'My profile',
      });
    } else {
      // Same tab, refresh data!
      queryClient.invalidateQueries({
        queryKey: ['user', user.name, 'scrobbles', 1],
      });
    }
  };

  let clearListButton;
  const hasUsername = !!user?.name;

  if (activeTab === 'history') {
    if (localScrobbles.length > 0) {
      clearListButton = (
        <div className="ms-auto d-flex my-auto">
          <Button className="btn-clear" size="sm" color="secondary" onClick={() => dispatch(clearListOfScrobbles())}>
            <FontAwesomeIcon icon={faTrashAlt} className="me-1" />
            <Trans i18nKey="clearHistory">Clear history</Trans>
          </Button>
        </div>
      );
    }
  }

  return (
    <ScrobbleCloneContext.Provider value={{ cloneFn: cloneReceiver, setCloneFn: setCloneReceiver }}>
      <div className="row flex-lg-grow-1 mt-3" data-cy="ScrobbleSong">
        <div className="col-md-6 mb-4 SongForm-container">
          <h2 className="mb-sm-4 mb-md-3">
            <FontAwesomeIcon icon={faPlayCircle} /> <Trans i18nKey="scrobbleSongs">Scrobble songs</Trans>
          </h2>
          <SongForm />
        </div>
        <div className="col-md-6 SongFormLists-container">
          <Nav tabs>
            <NavItem>
              <NavLink className={activeTab === 'history' ? 'active' : ''} onClick={goToHistoryTab}>
                <FontAwesomeIcon icon={faHistory} />
                <span className="ps-1 px-2">
                  <Trans i18nKey="history">History</Trans>
                </span>
                {unreadScrobbles > 0 && <Badge color="secondary">{unreadScrobbles}</Badge>}
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                disabled={!hasUsername}
                className={activeTab === 'userProfile' ? 'active' : ''}
                onClick={goToProfileTab}
              >
                <FontAwesomeIcon icon={hasUsername ? faUserAstronaut : faCompactDisc} spin={!hasUsername} />
                <span className="ps-2">
                  <Trans i18nKey="yourProfile">Your profile</Trans>
                </span>
              </NavLink>
            </NavItem>
            {clearListButton}
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane className="ScrobbleList-container pt-2" tabId="history">
              <ScrobbleList scrobbles={localScrobbles}>
                <EmptyScrobbleListFiller />
              </ScrobbleList>
            </TabPane>
            <TabPane className="ScrobbleList-container pt-2" tabId="userProfile">
              {user?.name && (
                <LastFmProfileHistory
                  username={user.name}
                  enabled={activeTab === 'userProfile' /* FIXME: use a better tab component */}
                />
              )}
            </TabPane>
          </TabContent>
        </div>
      </div>
    </ScrobbleCloneContext.Provider>
  );
};
