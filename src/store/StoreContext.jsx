import { createContext, useContext } from "react";
import { todoStore } from "./todoStore";

const StoreContext = createContext(todoStore);

export const StoreProvider = ({ children }) => (
  <StoreContext.Provider value={todoStore}>{children}</StoreContext.Provider>
);

export const useStore = () => useContext(StoreContext);
