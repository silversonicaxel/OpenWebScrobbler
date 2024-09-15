import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useGrowthBook } from '@growthbook/growthbook-react';
import ReactGA from 'react-ga-neo';

import useLocalStorage from './useLocalStorage';
import { userGetProfile } from 'utils/clients/api/methods/userGetProfile';
import { userTransformer } from 'utils/clients/api/transformers/user.transformer';
import type { User } from 'utils/types/user';
import { sha256 } from 'utils/common';
import { saveToLocalStorage } from 'localstorage';

const emptyUser = userTransformer(null);

export type UseUserDataResult = {
  user?: User;
  isLoggedIn: boolean;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  isReady: boolean;
};

export type UseUserDataHook = () => UseUserDataResult;

export const useUserData: UseUserDataHook = () => {
  const [storedUserData, updateStoredUserData] = useLocalStorage('user', emptyUser);
  const growthbook = useGrowthBook();
  const { data, isLoading, isFetching, isSuccess, isStale, isError } = useQuery({
    queryKey: ['user', 'self'],
    queryFn: () =>
      userGetProfile().then((data) => {
        updateStoredUserData(data);
        return data;
      }),
    staleTime: 1000 * 60 * 2, // minutes
    refetchOnWindowFocus: true,
    placeholderData: storedUserData,
  });
  const [hashedUserId, setHashedUserId] = useState(null);

  useEffect(() => {
    if (isSuccess && data?.user?.name) {
      sha256(data.user.name).then((hash) => {
        setHashedUserId(hash);
        ReactGA.set({
          userId: hash,
        });
        saveToLocalStorage('hashedUID', hash);
      });
    }
  }, [isSuccess, data]);

  useEffect(() => {
    if (growthbook?.ready) {
      growthbook.setAttributes({
        ...growthbook.getAttributes(),
        loggedIn: true,
        id: hashedUserId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [growthbook?.ready, hashedUserId]);

  return {
    user: data?.user,
    isLoggedIn: isLoading ? false : data?.isLoggedIn,
    isLoading,
    isError,
    isFetching,
    isReady: !isStale && !isFetching,
  };
};
