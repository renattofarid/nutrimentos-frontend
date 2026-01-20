import { useState, useCallback } from "react";
import {
  getPersonZones,
  getPrimaryPersonZone,
  getPersonZoneById,
  createPersonZone,
  updatePersonZone,
  setPersonZonePrimary,
  deletePersonZone,
} from "./personzone.actions";
import type {
  PersonZoneResource,
  PersonZoneCreateRequest,
  PersonZoneUpdateRequest,
} from "./personzone.interface";

/**
 * Hook para obtener las direcciones de una persona
 */
export function usePersonZones(personId: number | null) {
  const [data, setData] = useState<PersonZoneResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!personId) return;
    setIsLoading(true);
    setError(null);
    try {
      const zones = await getPersonZones(personId);
      setData(zones);
    } catch {
      setError("Error al cargar las direcciones");
    } finally {
      setIsLoading(false);
    }
  }, [personId]);

  const refetch = useCallback(() => {
    return fetch();
  }, [fetch]);

  return { data, isLoading, error, fetch, refetch };
}

/**
 * Hook para obtener la dirección primaria de una persona
 */
export function usePrimaryPersonZone(personId: number | null) {
  const [data, setData] = useState<PersonZoneResource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!personId) return;
    setIsLoading(true);
    setError(null);
    try {
      const zone = await getPrimaryPersonZone(personId);
      setData(zone);
    } catch {
      setError("Error al cargar la dirección primaria");
    } finally {
      setIsLoading(false);
    }
  }, [personId]);

  const refetch = useCallback(() => {
    return fetch();
  }, [fetch]);

  return { data, isLoading, error, fetch, refetch };
}

/**
 * Hook para obtener una dirección por ID
 */
export function usePersonZone(id: number | null) {
  const [data, setData] = useState<PersonZoneResource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const zone = await getPersonZoneById(id);
      setData(zone);
    } catch {
      setError("Error al cargar la dirección");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return { data, isLoading, error, fetch };
}

/**
 * Hook para mutaciones de direcciones (crear, actualizar, eliminar, establecer primaria)
 */
export function usePersonZoneMutations() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (data: PersonZoneCreateRequest): Promise<PersonZoneResource> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await createPersonZone(data);
        return result;
      } catch (err) {
        setError("Error al crear la dirección");
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const update = useCallback(
    async (
      id: number,
      data: PersonZoneUpdateRequest
    ): Promise<PersonZoneResource> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await updatePersonZone(id, data);
        return result;
      } catch (err) {
        setError("Error al actualizar la dirección");
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const setPrimary = useCallback(
    async (id: number): Promise<PersonZoneResource> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await setPersonZonePrimary(id);
        return result;
      } catch (err) {
        setError("Error al establecer como primaria");
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const remove = useCallback(async (id: number): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    try {
      await deletePersonZone(id);
    } catch (err) {
      setError("Error al eliminar la dirección");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    create,
    update,
    setPrimary,
    remove,
    isSubmitting,
    error,
  };
}
