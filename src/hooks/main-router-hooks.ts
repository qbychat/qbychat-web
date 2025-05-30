/*
 *  Copyright (c) 2025. All rights reserved.
 *  This file is a part of the QbyChat project
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import useMainRouterStore, { ViewName, ViewParamsMap } from '@/stores/router/main-router-store.ts';
import { useContext, useEffect } from 'react';
import { ViewContext } from '@/components/router/ViewContext.tsx';

export const useCurrentMobileViewEntry = () =>
  useMainRouterStore(state => state.view);

export const usePreviousMobileViewEntry = () =>
  useMainRouterStore(state => state.previousView);

export const useCurrentLeftDesktopViewEntry = () =>
  useMainRouterStore(state => state.leftView);

export const useCurrentRightDesktopViewEntry = () =>
  useMainRouterStore(state => state.rightView);

export const usePreviousLeftDesktopViewEntry = () =>
  useMainRouterStore(state => state.previousLeftView);

export const usePreviousRightDesktopViewEntry = () =>
  useMainRouterStore(state => state.previousRightView);

export function useIsBackDirection(): boolean {
  return useMainRouterStore((s) => s.isBack);
}

export function useRouterHistorySync() {
  const syncFromHistory = useMainRouterStore((s) => s.syncFromHistory);

  useEffect(() => {
    syncFromHistory();

    const onPopState = () => {
      syncFromHistory();
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [syncFromHistory]);
}

export const useStackControls = () => {
  const pushView = useMainRouterStore(state => state.pushView);
  const popView = useMainRouterStore(state => state.popView);
  const goBack = useMainRouterStore(state => state.goBack);
  const syncFromHistory = useMainRouterStore(state => state.syncFromHistory);

  return {
    pushView,
    popView,
    goBack,
    syncFromHistory,
  };
};

export const useViewParams = () => {
  const { cacheKey } = useContext(ViewContext)!;
  const paramsMap = useMainRouterStore(s => s.paramsMap);
  const originUpdateParams = useMainRouterStore(s => s.updateParams);

  const updateParams = (newParams: ViewParamsMap[ViewName], replace?: boolean) => {
    originUpdateParams(cacheKey, newParams, replace);
  };

  const params = paramsMap[cacheKey];

  return {
    params,
    updateParams,
  };
};