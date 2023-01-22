import { mount } from '@vue/test-utils';
import ProductCard from '@/components/ProductCard';
import { makeServer } from '@/miragejs/server';

let server;
// coloquei o server fora do escopo do describe pois o mountProductCard não o reconhecia

const mountProductCard = () => {
  const product = server.create('product', {
    title: 'Boa noite',
    price: '22.00',
    image:
      'https://images.unsplash.com/photo-1444881421460-d838c3b98f95?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=889&q=80',
  });
  // server.create está trazendo os dados da prop
  // product: {},

  return {
    wrapper: mount(ProductCard, {
      // mount monta o componente
      propsData: {
        // propsData trás a prop declarada no componente em questão
        product,
      },
    }),
    product,
  };
};

describe('ProductCard - unit', () => {
  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  it('should match snapshot', () => {
    const { wrapper } = mountProductCard();

    expect(wrapper.element).toMatchSnapshot();
    // toMatchSnapshot vai gerar uma pasta exemplo com a réplica do template html com os dados passados estáticamente na prop do teste
  });

  it('should mount the component', () => {
    const { wrapper } = mountProductCard();

    // console.log(wrapper.vm); Vue Component
    // console.log(wrapper.classes); Classes do CSS
    // console.log(wrapper.element); Elementos HTML
    // console.log(wrapper.exists); Se existe ou não
    // console.log(wrapper.html()); Template do HTML

    expect(wrapper.vm).toBeDefined();
    expect(wrapper.text()).toContain('Boa noite');
    expect(wrapper.text()).toContain('22.00');
  });

  it('should emit the event addToCart with product object when button gets clicked', async () => {
    const { wrapper, product } = mountProductCard();

    await wrapper.find('button').trigger('click');
    // await para quando o evento em questão for disparado

    // assert event has been emitted
    expect(wrapper.emitted().addToCart).toBeTruthy();

    // assert event count
    expect(wrapper.emitted().addToCart.length).toBe(1);

    // assert event payload
    expect(wrapper.emitted().addToCart[0]).toEqual([{ product }]);
  });
});
