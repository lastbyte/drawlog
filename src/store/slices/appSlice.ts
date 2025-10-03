import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AppState {
  isLoading: boolean;
  breadcrumbs?: BreadCrumb[];
  isSidebarCollapsed?: boolean;
  boardSplitterPosition?: number; // percentage (0-100)
  defaults: {
    sidebarCollapsed: boolean;
  };
  theme: "light" | "dark" | "system";
}

const initialState: AppState = {
  isLoading: false,
  breadcrumbs: [],
  isSidebarCollapsed: true, // true means collapsed by default
  defaults: {
    sidebarCollapsed: true, // consistent default
  },
  theme: "system",
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setBreadCrumbs: (state, action: PayloadAction<AppState["breadcrumbs"]>) => {
      state.breadcrumbs = action.payload;
    },
    setTheme: (state, action: PayloadAction<AppState["theme"]>) => {
      state.theme = action.payload;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    setBoardSplitterPosition: (state, action: PayloadAction<number>) => {
      state.boardSplitterPosition = action.payload;
    },
  },
});

export const {
  setLoading,
  setBreadCrumbs,
  setTheme,
  setSidebarCollapsed,
  setBoardSplitterPosition,
} = appSlice.actions;
export default appSlice.reducer;
