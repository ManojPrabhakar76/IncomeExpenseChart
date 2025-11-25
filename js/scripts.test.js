
// js/scripts.test.js

describe('usernameRegex', () => {
    const usernameRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    test.each([
        // Valid usernames
        ['Valid: All criteria met', 'Password1!', true],
        ['Valid: Minimum length with all criteria', 'A1@bcdef', true],
        ['Valid: Longer valid username', 'StrongPass1$', true],

        // Invalid usernames
        ['Invalid: No uppercase letter', 'password1!', false],
        ['Invalid: No number', 'Password!', false],
        ['Invalid: No special character', 'Password1', false],
        ['Invalid: Less than 8 characters', 'P1@a', false],
        ['Invalid: Empty string', '', false],
    ])('%s', (_, input, expected) => {
        expect(usernameRegex.test(input)).toBe(expected);
    });
});