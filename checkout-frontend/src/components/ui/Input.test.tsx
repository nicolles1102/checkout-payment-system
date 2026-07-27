import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('should render with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should generate id from label', () => {
    render(<Input label="Full Name" />);
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
  });

  it('should use custom id when provided', () => {
    render(<Input label="Email" id="custom-id" />);
    expect(screen.getByLabelText('Email').id).toBe('custom-id');
  });

  it('should show icon when provided', () => {
    render(<Input label="Search" icon={<span data-testid="icon">🔍</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should show error message when error is provided', () => {
    render(<Input label="Email" error="Email is required" />);
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('should apply error styles when error is provided', () => {
    render(<Input label="Email" error="Invalid" />);
    const input = screen.getByLabelText('Email');
    expect(input.className).toContain('border-red');
  });

  it('should not show error when not provided', () => {
    render(<Input label="Email" />);
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
  });

  it('should pass through input props', () => {
    render(<Input label="Email" placeholder="test@email.com" type="email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('placeholder', 'test@email.com');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should handle onChange', () => {
    const handleChange = jest.fn();
    render(<Input label="Name" onChange={handleChange} />);
    const input = screen.getByLabelText('Name');
    fireEvent.change(input, { target: { value: 'Oso' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});