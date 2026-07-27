import { render, screen } from '@testing-library/react';
import { StepIndicator } from './StepIndicator';

describe('StepIndicator', () => {
  it('should render all 4 steps', () => {
    render(<StepIndicator currentStep="product" />);
    expect(screen.getByText('Producto')).toBeInTheDocument();
    expect(screen.getByText('Pago y Envío')).toBeInTheDocument();
    expect(screen.getByText('Resumen')).toBeInTheDocument();
    expect(screen.getByText('Resultado')).toBeInTheDocument();
  });

  it('should mark current step with active styling', () => {
    render(<StepIndicator currentStep="checkout" />);
    const step2 = screen.getByText('Pago y Envío');
    expect(step2.className).toContain('purple');
  });

  it('should mark completed steps with check icon', () => {
    const { container } = render(<StepIndicator currentStep="summary" />);
    // Steps 1 and 2 should be completed (show checkmarks)
    // Check there's at least one SVG (check icon) for completed steps
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });

  it('should mark all steps as completed when on result step', () => {
    const { container } = render(<StepIndicator currentStep="result" />);
    // All previous steps should show completed styling - check icons should exist
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(3);
  });

  it('should show inactive styling for future steps', () => {
    render(<StepIndicator currentStep="product" />);
    // Steps 2, 3, 4 should be inactive
    const checkoutLabel = screen.getByText('Pago y Envío');
    expect(checkoutLabel.className).toContain('gray-600');
  });
});
