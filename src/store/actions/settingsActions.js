import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { fallbackLng } from 'utils/i18n';

import { createAlert } from 'store/actions/alertActions';
import { openscrobblerAPI } from 'utils/clients/api/apiClient';

import {
  SETTINGS_UPDATE,
  SETTINGS_SAVE,
  SETTINGS_DEBOUNCE_PERIOD,
  SETTINGS_MODAL_OPEN,
  SETTINGS_MODAL_CLOSE,
} from 'Constants';

export function setSettings(dispatch) {
  // ToDo: split so there is one action to save locally, other to post server
  return (newSettings, pushToServer = true, silent = false) => {
    if (pushToServer) {
      dispatch({
        type: SETTINGS_SAVE,
        meta: {
          debounce: { time: silent ? SETTINGS_DEBOUNCE_PERIOD : 1 },
        },
        payload: () => {
          openscrobblerAPI
            .post('/settings.php', newSettings)
            .then(() => {
              if (!silent) {
                dispatch(
                  createAlert({
                    type: 'success',
                    category: 'settings',
                    message: 'settingsSavedSuccessfully',
                  })
                );
              }
            })
            .catch(() => {
              if (!silent) {
                dispatch(
                  createAlert({
                    type: 'warning',
                    category: 'settings',
                    rawMessage: 'Error saving settings',
                  })
                );
              }
            });
        },
      });
    }

    if (newSettings.lang) {
      let newLang = newSettings.lang;
      if (newSettings.lang === 'auto') {
        newLang = new LanguageDetector().detectors.navigator.lookup()[0] || fallbackLng.default[0];
        if (newLang.length > 2 && Object.prototype.hasOwnProperty.call(fallbackLng, newLang)) {
          newLang = fallbackLng[newLang][0];
        }
      }
      i18n.changeLanguage(newLang);
    }

    dispatch({
      type: SETTINGS_UPDATE,
      payload: newSettings,
    });
  };
}

export function openSettingsModal() {
  return {
    type: SETTINGS_MODAL_OPEN,
  };
}

export function closeSettingsModal() {
  return {
    type: SETTINGS_MODAL_CLOSE,
  };
}
