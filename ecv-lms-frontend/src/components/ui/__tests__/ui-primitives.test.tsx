import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Button,
  Card, CardHeader, CardTitle, CardContent, CardFooter,
  Input,
  Skeleton,
  StatusBadge,
  Toast,
} from '../index';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Button variant="danger">Delete</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-red-600');
  });

  it('disables when isLoading', () => {
    render(<Button isLoading>Save</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('is keyboard focusable', () => {
    render(<Button>Focus me</Button>);
    const btn = screen.getByRole('button');
    btn.focus();
    expect(document.activeElement).toBe(btn);
  });

  it('calls onClick handler', () => {
    const handler = vi.fn();
    render(<Button onClick={handler}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledOnce();
  });
});

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders sub-components', () => {
    render(
      <Card>
        <CardHeader><CardTitle>Title</CardTitle></CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows error message with aria-invalid', () => {
    render(<Input label="Email" error="Required field" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Required field');
  });

  it('shows helper text', () => {
    render(<Input label="Name" helperText="Enter your full name" />);
    expect(screen.getByText('Enter your full name')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Input ref={ref} label="Test" />);
    expect(ref).toHaveBeenCalled();
  });
});

describe('Skeleton', () => {
  it('renders with loading status', () => {
    render(<Skeleton />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    const { container } = render(<Skeleton variant="circular" />);
    expect(container.firstChild).toHaveClass('rounded-full');
  });
});

describe('StatusBadge', () => {
  it('renders with default label', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByRole('status')).toHaveTextContent('Active');
  });

  it('renders with custom label', () => {
    render(<StatusBadge status="pending" label="Awaiting Review" />);
    expect(screen.getByRole('status')).toHaveTextContent('Awaiting Review');
  });

  it('applies correct style for error status', () => {
    render(<StatusBadge status="error" />);
    expect(screen.getByRole('status').className).toContain('bg-red-50');
  });
});

describe('Toast', () => {
  it('renders when visible', () => {
    render(<Toast message="Saved!" variant="success" isVisible onClose={vi.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Saved!');
  });

  it('does not render when not visible', () => {
    render(<Toast message="Hidden" isVisible={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('calls onClose when dismiss is clicked', () => {
    const onClose = vi.fn();
    render(<Toast message="Test" isVisible onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Dismiss notification'));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
