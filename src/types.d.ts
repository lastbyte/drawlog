// Global type definitions and utilities
declare global {
  // Global interfaces
  interface BreadCrumb {
    title: string;
    location: string;
  }

  // Common React types - globally available
  type ReactNode = import("react").ReactNode;
  type ReactElement = import("react").ReactElement;
  type ComponentProps<
    T extends
      | keyof JSX.IntrinsicElements
      | import("react").JSXElementConstructor<any>
  > = import("react").ComponentProps<T>;
  type FC<P = {}> = import("react").FC<P>;
  type PropsWithChildren<P = unknown> = import("react").PropsWithChildren<P>;
  type CSSProperties = import("react").CSSProperties;
  type RefObject<T> = import("react").RefObject<T>;
  type MutableRefObject<T> = import("react").MutableRefObject<T>;
  type Ref<T> = import("react").Ref<T>;

  // React hooks types
  type UseStateReturn<T> = [
    T,
    import("react").Dispatch<import("react").SetStateAction<T>>
  ];
  type UseEffectDeps = import("react").DependencyList;
  type UseCallbackDeps = import("react").DependencyList;
  type UseMemoReturn<T> = T;

  // Common HTML element props
  type DivProps = import("react").HTMLAttributes<HTMLDivElement>;
  type ButtonProps = import("react").ButtonHTMLAttributes<HTMLButtonElement>;
  type InputProps = import("react").InputHTMLAttributes<HTMLInputElement>;
  type FormProps = import("react").FormHTMLAttributes<HTMLFormElement>;
  type SpanProps = import("react").HTMLAttributes<HTMLSpanElement>;
  type HeadingProps = import("react").HTMLAttributes<HTMLHeadingElement>;
  type AnchorProps = import("react").AnchorHTMLAttributes<HTMLAnchorElement>;
  type ImageProps = import("react").ImgHTMLAttributes<HTMLImageElement>;
  type TextareaProps =
    import("react").TextareaHTMLAttributes<HTMLTextAreaElement>;
  type SelectProps = import("react").SelectHTMLAttributes<HTMLSelectElement>;

  // Utility types
  type ClassValue = import("clsx").ClassValue;
  type VariantProps<T> = import("class-variance-authority").VariantProps<T>;

  // Router types
  type RouteMetaArgs = import("react-router").MetaArgs;
  type RouteLoaderArgs = import("react-router").LoaderArgs;
  type RouteActionArgs = import("react-router").ActionArgs;

  // App-specific types
  interface NavItem {
    title: string;
    url: string;
    icon?: import("react").ComponentType<any>;
    isActive?: boolean;
    items?: NavItem[];
  }

  interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }

  interface Workspace {
    id: string;
    name: string;
    plan: string;
  }

  interface SidebarData {
    user: User;
    teams: Workspace[];
    navMain: NavItem[];
    navSecondary: NavItem[];
    projects: NavItem[];
  }

  // Board and storage types
  interface Board {
    id: string;
    name: string;
    richtext: string;
    tldraw_content: string;
    created_at: string;
    updated_at: string;
  }

  // Component prop types for common UI patterns
  interface BaseComponentProps {
    className?: string;
    children?: ReactNode;
  }

  interface IconProps extends BaseComponentProps {
    size?: number | string;
    color?: string;
  }

  interface LoadingProps {
    isLoading?: boolean;
    loadingText?: string;
  }

  interface ErrorProps {
    error?: Error | string | null;
    onRetry?: () => void;
  }

  // Utility function types
  var cn: typeof import("~/lib/utils").cn;
}

export {};
