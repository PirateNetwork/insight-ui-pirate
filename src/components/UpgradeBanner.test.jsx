import {render, screen} from '@testing-library/react';
import '../i18n';
import {UpgradeBannerView} from './UpgradeBanner';

describe('UpgradeBannerView', () => {
  it('renders nothing when no upgrade is in its window', () => {
    const {container} = render(<UpgradeBannerView banners={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders an active upgrade with its activation block', () => {
    render(
      <UpgradeBannerView
        banners={[{kind: 'active', branchId: '37a5165b', name: 'Ironwood', activationHeight: 4161185}]}
      />
    );
    expect(screen.getByRole('status')).toHaveTextContent('Ironwood is live');
    expect(screen.getByRole('status')).toHaveTextContent('Activated at block 4161185');
  });

  it('renders a pending upgrade with blocks remaining and the target block', () => {
    render(
      <UpgradeBannerView
        banners={[
          {kind: 'pending', branchId: 'deadbeef', name: 'Nextfork', activationHeight: 4300000, blocksRemaining: 2500}
        ]}
      />
    );
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Nextfork network upgrade');
    expect(status).toHaveTextContent('2500 blocks remaining');
    expect(status).toHaveTextContent('activates at block 4300000');
  });

  it('uses the singular for the last remaining block', () => {
    render(
      <UpgradeBannerView
        banners={[{kind: 'pending', branchId: 'deadbeef', name: 'Nextfork', activationHeight: 10, blocksRemaining: 1}]}
      />
    );
    expect(screen.getByRole('status')).toHaveTextContent('1 block remaining');
  });

  it('renders one banner per upgrade', () => {
    render(
      <UpgradeBannerView
        banners={[
          {kind: 'active', branchId: '37a5165b', name: 'Ironwood', activationHeight: 100},
          {kind: 'pending', branchId: 'deadbeef', name: 'Nextfork', activationHeight: 3000, blocksRemaining: 2000}
        ]}
      />
    );
    expect(screen.getAllByRole('status')).toHaveLength(2);
  });
});
