"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface InsuranceUser {

  id: string;

  firstName: string;

  lastName: string;

  email: string;

  role: string;

  insuranceProviderId: string;

  insuranceProviderName: string | null;
}

interface AuthState {

  token: string | null;

  user: InsuranceUser | null;

  loading: boolean;

  hydrated: boolean;

  setAuth: (
    token: string,
    user: InsuranceUser
  ) => void;

  login: (
    token: string,
    user: InsuranceUser
  ) => void;

  logout: () => void;

  setLoading: (
    loading: boolean
  ) => void;

  setHydrated: () => void;
}

export const useAuthStore =
  create<AuthState>()(
    persist(
      (set) => ({

        token: null,

        user: null,

        loading: false,

        hydrated: false,

        setAuth: (
          token,
          user
        ) => {

          set({
            token,
            user
          });
        },

        login: (
          token,
          user
        ) => {

          set({
            token,
            user
          });
        },

        logout: () => {

          set({
            token: null,
            user: null
          });
        },

        setLoading: (
          loading
        ) =>

          set({
            loading
          }),

        setHydrated: () =>

          set({
            hydrated: true
          })

      }),
      {
        name: "insurer-auth-storage",

        onRehydrateStorage:
          () => (state) => {

            state?.setHydrated();
          }
      }
    )
  );