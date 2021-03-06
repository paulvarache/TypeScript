//// [conditionalTypes2.ts]
// #27118: Conditional types are now invariant in the check type.

interface Covariant<T> {
    foo: T extends string ? T : number;
}

interface Contravariant<T> {
    foo: T extends string ? keyof T : number;
}

interface Invariant<T> {
    foo: T extends string ? keyof T : T;
}

function f1<A, B extends A>(a: Covariant<A>, b: Covariant<B>) {
    a = b;  // Error
    b = a;  // Error
}

function f2<A, B extends A>(a: Contravariant<A>, b: Contravariant<B>) {
    a = b;  // Error
    b = a;  // Error
}

function f3<A, B extends A>(a: Invariant<A>, b: Invariant<B>) {
    a = b;  // Error
    b = a;  // Error
}

// Extract<T, Function> is a T that is known to be a Function
function isFunction<T>(value: T): value is Extract<T, Function> {
    return typeof value === "function";
}

function getFunction<T>(item: T) {
    if (isFunction(item)) {
        return item;
    }
    throw new Error();
}

function f10<T>(x: T) {
    if (isFunction(x)) {
        const f: Function = x;
        const t: T = x;
    }
}

function f11(x: string | (() => string) | undefined) {
    if (isFunction(x)) {
        x();
    }
}

function f12(x: string | (() => string) | undefined) {
    const f = getFunction(x);  // () => string
    f();
}

type Foo = { foo: string };
type Bar = { bar: string };

declare function fooBar(x: { foo: string, bar: string }): void;
declare function fooBat(x: { foo: string, bat: string }): void;

type Extract2<T, U, V> = T extends U ? T extends V ? T : never : never;

function f20<T>(x: Extract<Extract<T, Foo>, Bar>, y: Extract<T, Foo & Bar>, z: Extract2<T, Foo, Bar>) {
    fooBar(x);
    fooBar(y);
    fooBar(z);
}

function f21<T>(x: Extract<Extract<T, Foo>, Bar>, y: Extract<T, Foo & Bar>, z: Extract2<T, Foo, Bar>) {
    fooBat(x);  // Error
    fooBat(y);  // Error
    fooBat(z);  // Error
}

// Repro from #22899

declare function toString1(value: object | Function): string ;
declare function toString2(value: Function): string ;

function foo<T>(value: T) {
    if (isFunction(value)) {
        toString1(value);
        toString2(value);
    }
}

// Repro from #23052

type A<T, V, E> =
  T extends object
    ? { [Q in { [P in keyof T]: T[P] extends V ? P : P; }[keyof T]]: A<T[Q], V, E>; }
    : T extends V ? T : never;

type B<T, V> =
  T extends object
    ? { [Q in { [P in keyof T]: T[P] extends V ? P : P; }[keyof T]]: B<T[Q], V>; }
    : T extends V ? T : never;

type C<T, V, E> =
  { [Q in { [P in keyof T]: T[P] extends V ? P : P; }[keyof T]]: C<T[Q], V, E>; };

// Repro from #23100

type A2<T, V, E> =
    T extends object ? T extends any[] ? T : { [Q in keyof T]: A2<T[Q], V, E>; } : T;

type B2<T, V> =
    T extends object ? T extends any[] ? T : { [Q in keyof T]: B2<T[Q], V>; } : T;

type C2<T, V, E> =
    T extends object ? { [Q in keyof T]: C2<T[Q], V, E>; } : T;

// Repro from #28654

type MaybeTrue<T extends { b: boolean }> = true extends T["b"] ? "yes" : "no";

type T0 = MaybeTrue<{ b: never }>     // "no"
type T1 = MaybeTrue<{ b: false }>;    // "no"
type T2 = MaybeTrue<{ b: true }>;     // "yes"
type T3 = MaybeTrue<{ b: boolean }>;  // "yes"

// Repro from #28824

type Union = 'a' | 'b';
type Product<A extends Union, B> = { f1: A, f2: B};
type ProductUnion = Product<'a', 0> | Product<'b', 1>;

// {a: "b"; b: "a"}
type UnionComplement = {
  [K in Union]: Exclude<Union, K>
};
type UCA = UnionComplement['a'];
type UCB = UnionComplement['b'];

// {a: "a"; b: "b"}
type UnionComplementComplement = {
  [K in Union]: Exclude<Union, Exclude<Union, K>>
};
type UCCA = UnionComplementComplement['a'];
type UCCB = UnionComplementComplement['b'];

// {a: Product<'b', 1>; b: Product<'a', 0>}
type ProductComplement = {
  [K in Union]: Exclude<ProductUnion, { f1: K }>
};
type PCA = ProductComplement['a'];
type PCB = ProductComplement['b'];

// {a: Product<'a', 0>; b: Product<'b', 1>}
type ProductComplementComplement = {
  [K in Union]: Exclude<ProductUnion, Exclude<ProductUnion, { f1: K }>>
};
type PCCA = ProductComplementComplement['a'];
type PCCB = ProductComplementComplement['b'];

// Repros from #27118

type MyElement<A> = [A] extends [[infer E]] ? E : never;
function oops<A, B extends A>(arg: MyElement<A>): MyElement<B> {
    return arg;  // Unsound, should be error
}

type MyAcceptor<A> = [A] extends [[infer E]] ? (arg: E) => void : never;
function oops2<A, B extends A>(arg: MyAcceptor<B>): MyAcceptor<A> {
    return arg;  // Unsound, should be error
}

type Dist<T> = T extends number ? number : string;
type Aux<A extends { a: unknown }> = A["a"] extends number ? number : string;
type Nondist<T> = Aux<{a: T}>;
function oops3<T>(arg: Dist<T>): Nondist<T> {
    return arg;  // Unsound, should be error
}


//// [conditionalTypes2.js]
"use strict";
// #27118: Conditional types are now invariant in the check type.
function f1(a, b) {
    a = b; // Error
    b = a; // Error
}
function f2(a, b) {
    a = b; // Error
    b = a; // Error
}
function f3(a, b) {
    a = b; // Error
    b = a; // Error
}
// Extract<T, Function> is a T that is known to be a Function
function isFunction(value) {
    return typeof value === "function";
}
function getFunction(item) {
    if (isFunction(item)) {
        return item;
    }
    throw new Error();
}
function f10(x) {
    if (isFunction(x)) {
        var f = x;
        var t = x;
    }
}
function f11(x) {
    if (isFunction(x)) {
        x();
    }
}
function f12(x) {
    var f = getFunction(x); // () => string
    f();
}
function f20(x, y, z) {
    fooBar(x);
    fooBar(y);
    fooBar(z);
}
function f21(x, y, z) {
    fooBat(x); // Error
    fooBat(y); // Error
    fooBat(z); // Error
}
function foo(value) {
    if (isFunction(value)) {
        toString1(value);
        toString2(value);
    }
}
function oops(arg) {
    return arg; // Unsound, should be error
}
function oops2(arg) {
    return arg; // Unsound, should be error
}
function oops3(arg) {
    return arg; // Unsound, should be error
}


//// [conditionalTypes2.d.ts]
interface Covariant<T> {
    foo: T extends string ? T : number;
}
interface Contravariant<T> {
    foo: T extends string ? keyof T : number;
}
interface Invariant<T> {
    foo: T extends string ? keyof T : T;
}
declare function f1<A, B extends A>(a: Covariant<A>, b: Covariant<B>): void;
declare function f2<A, B extends A>(a: Contravariant<A>, b: Contravariant<B>): void;
declare function f3<A, B extends A>(a: Invariant<A>, b: Invariant<B>): void;
declare function isFunction<T>(value: T): value is Extract<T, Function>;
declare function getFunction<T>(item: T): Extract<T, Function>;
declare function f10<T>(x: T): void;
declare function f11(x: string | (() => string) | undefined): void;
declare function f12(x: string | (() => string) | undefined): void;
declare type Foo = {
    foo: string;
};
declare type Bar = {
    bar: string;
};
declare function fooBar(x: {
    foo: string;
    bar: string;
}): void;
declare function fooBat(x: {
    foo: string;
    bat: string;
}): void;
declare type Extract2<T, U, V> = T extends U ? T extends V ? T : never : never;
declare function f20<T>(x: Extract<Extract<T, Foo>, Bar>, y: Extract<T, Foo & Bar>, z: Extract2<T, Foo, Bar>): void;
declare function f21<T>(x: Extract<Extract<T, Foo>, Bar>, y: Extract<T, Foo & Bar>, z: Extract2<T, Foo, Bar>): void;
declare function toString1(value: object | Function): string;
declare function toString2(value: Function): string;
declare function foo<T>(value: T): void;
declare type A<T, V, E> = T extends object ? {
    [Q in {
        [P in keyof T]: T[P] extends V ? P : P;
    }[keyof T]]: A<T[Q], V, E>;
} : T extends V ? T : never;
declare type B<T, V> = T extends object ? {
    [Q in {
        [P in keyof T]: T[P] extends V ? P : P;
    }[keyof T]]: B<T[Q], V>;
} : T extends V ? T : never;
declare type C<T, V, E> = {
    [Q in {
        [P in keyof T]: T[P] extends V ? P : P;
    }[keyof T]]: C<T[Q], V, E>;
};
declare type A2<T, V, E> = T extends object ? T extends any[] ? T : {
    [Q in keyof T]: A2<T[Q], V, E>;
} : T;
declare type B2<T, V> = T extends object ? T extends any[] ? T : {
    [Q in keyof T]: B2<T[Q], V>;
} : T;
declare type C2<T, V, E> = T extends object ? {
    [Q in keyof T]: C2<T[Q], V, E>;
} : T;
declare type MaybeTrue<T extends {
    b: boolean;
}> = true extends T["b"] ? "yes" : "no";
declare type T0 = MaybeTrue<{
    b: never;
}>;
declare type T1 = MaybeTrue<{
    b: false;
}>;
declare type T2 = MaybeTrue<{
    b: true;
}>;
declare type T3 = MaybeTrue<{
    b: boolean;
}>;
declare type Union = 'a' | 'b';
declare type Product<A extends Union, B> = {
    f1: A;
    f2: B;
};
declare type ProductUnion = Product<'a', 0> | Product<'b', 1>;
declare type UnionComplement = {
    [K in Union]: Exclude<Union, K>;
};
declare type UCA = UnionComplement['a'];
declare type UCB = UnionComplement['b'];
declare type UnionComplementComplement = {
    [K in Union]: Exclude<Union, Exclude<Union, K>>;
};
declare type UCCA = UnionComplementComplement['a'];
declare type UCCB = UnionComplementComplement['b'];
declare type ProductComplement = {
    [K in Union]: Exclude<ProductUnion, {
        f1: K;
    }>;
};
declare type PCA = ProductComplement['a'];
declare type PCB = ProductComplement['b'];
declare type ProductComplementComplement = {
    [K in Union]: Exclude<ProductUnion, Exclude<ProductUnion, {
        f1: K;
    }>>;
};
declare type PCCA = ProductComplementComplement['a'];
declare type PCCB = ProductComplementComplement['b'];
declare type MyElement<A> = [A] extends [[infer E]] ? E : never;
declare function oops<A, B extends A>(arg: MyElement<A>): MyElement<B>;
declare type MyAcceptor<A> = [A] extends [[infer E]] ? (arg: E) => void : never;
declare function oops2<A, B extends A>(arg: MyAcceptor<B>): MyAcceptor<A>;
declare type Dist<T> = T extends number ? number : string;
declare type Aux<A extends {
    a: unknown;
}> = A["a"] extends number ? number : string;
declare type Nondist<T> = Aux<{
    a: T;
}>;
declare function oops3<T>(arg: Dist<T>): Nondist<T>;
