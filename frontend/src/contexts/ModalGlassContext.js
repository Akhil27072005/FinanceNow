import { createContext, useContext } from 'react';

export const ModalGlassContext = createContext(false);

export const useModalGlass = () => useContext(ModalGlassContext);
