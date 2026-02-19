export function cssVar(name: string, value: string) {
    return { [name]: value } as React.CSSProperties;
}