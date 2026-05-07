// src/__tests__/components/CodeEditor.test.jsx
import { render, screen } from '@testing-library/react';
import CodeEditor from '../../components/modules/development/CodeEditor';
import { expect, test, describe } from 'vitest';

describe('CodeEditor', () => {
  test('renderiza el editor correctamente', () => {
    render(<CodeEditor />);
    // Verifica que el título del módulo esté presente
    expect(screen.getByText('Editor de Código')).toBeInTheDocument();
    // Verifica que el mensaje de "en desarrollo" esté presente
    expect(screen.getByText(/Este módulo está actualmente en desarrollo/i)).toBeInTheDocument();
  });
});
