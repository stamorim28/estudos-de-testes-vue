import { mount } from '@vue/test-utils';
import ProductCard from '@/components/ProductCard';
import { makeServer } from '@/miragejs/server';

describe('ProductCard - unit', () => {
  let server;
  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  it('should match snapshot', () => {
    const wrapper = mount(ProductCard, {
      // mount monta o componente
      propsData: {
        // propsData trás a prop declarada no componente em questão
        product: server.create('product', {
          title: 'Boa noite',
          price: '22.00',
          image:
            'https://images.unsplash.com/photo-1444881421460-d838c3b98f95?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=889&q=80',
        }),
        // server.create está trazendo os dados da prop
        // product: {},
      },
    });

    expect(wrapper.element).toMatchSnapshot();
    // toMatchSnapshot vai gerar uma pasta exemplo com a réplica do template html com os dados passados estáticamente na prop do teste
  });

  it('should mount the component', () => {
    const wrapper = mount(ProductCard, {
      // mount monta o componente
      propsData: {
        // propsData trás a prop declarada no componente em questão
        product: server.create('product', {
          title: 'Boa noite',
          price: '22.00',
        }),
        // server.create está trazendo os dados da prop
        // product: {},
      },
    });

    // console.log(wrapper.vm); Vue Component
    // console.log(wrapper.classes); Classes do CSS
    // console.log(wrapper.element); Elementos HTML
    // console.log(wrapper.exists); Se existe ou não
    // console.log(wrapper.html()); Template do HTML

    expect(wrapper.vm).toBeDefined();
    expect(wrapper.text()).toContain('Boa noite');
    expect(wrapper.text()).toContain('22.00');
  });
});
