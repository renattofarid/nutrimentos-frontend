import { useUbigeoStore } from "./ubigeo.store";

export const useUbigeoSearch = () => {
  const { ubigeos, isSearching, searchUbigeos } = useUbigeoStore();

  return {
    ubigeos,
    isSearching,
    searchUbigeos,
  };
};
