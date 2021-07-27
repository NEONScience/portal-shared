import StateService from '../../service/StateService';

const key = 'downloadDataContextState';

export const persistState = (state: object) => {
  StateService.setObject(key, state);
};

export const readState = () => StateService.getObject(key);
