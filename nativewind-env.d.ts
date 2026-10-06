/// <reference types="nativewind/types" />

// TypeScript 6 rejects side-effect imports without a declaration; global.css is
// consumed by the NativeWind metro transformer, not by TS.
declare module '*.css';
