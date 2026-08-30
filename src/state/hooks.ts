import { useContext } from 'react';
import type { Dispatch } from 'react';
import { DispatchContext, StateContext } from './contexts';
import type { AppAction } from './reducer';
import type { AppState } from '../types';

export function useAppState(): AppState {
  const state = useContext(StateContext);
  if (state === null) throw new Error('useAppState doit être utilisé sous <AppStateProvider>.');
  return state;
}

export function useAppDispatch(): Dispatch<AppAction> {
  const dispatch = useContext(DispatchContext);
  if (dispatch === null) throw new Error('useAppDispatch doit être utilisé sous <AppStateProvider>.');
  return dispatch;
}
