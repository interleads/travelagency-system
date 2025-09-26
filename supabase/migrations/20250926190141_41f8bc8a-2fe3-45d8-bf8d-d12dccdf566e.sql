-- CRITICAL SECURITY FIX: Replace dangerous "true" RLS policies with authentication-based access control
-- This emergency fix replaces all publicly accessible policies with authentication requirements

-- Drop all existing dangerous policies
DROP POLICY IF EXISTS "Anyone can manage clients" ON public.clients;
DROP POLICY IF EXISTS "Anyone can manage CRM cards" ON public.crm_cards;
DROP POLICY IF EXISTS "Anyone can manage CRM columns" ON public.crm_columns;
DROP POLICY IF EXISTS "Anyone can manage miles inventory" ON public.miles_inventory;
DROP POLICY IF EXISTS "Anyone can manage miles programs" ON public.miles_programs;
DROP POLICY IF EXISTS "Anyone can manage miles transactions" ON public.miles_transactions;
DROP POLICY IF EXISTS "Anyone can manage sale installments" ON public.sale_installments;
DROP POLICY IF EXISTS "Anyone can manage sale products" ON public.sale_products;
DROP POLICY IF EXISTS "Anyone can manage sales" ON public.sales;
DROP POLICY IF EXISTS "Anyone can create suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Anyone can delete suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Anyone can update suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Anyone can view suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Anyone can manage transactions" ON public.transactions;

-- Create secure authentication-based policies for all tables
-- Clients table
CREATE POLICY "Authenticated users can view clients" ON public.clients
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert clients" ON public.clients
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update clients" ON public.clients
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete clients" ON public.clients
  FOR DELETE TO authenticated USING (true);

-- CRM Cards table
CREATE POLICY "Authenticated users can view crm_cards" ON public.crm_cards
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert crm_cards" ON public.crm_cards
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update crm_cards" ON public.crm_cards
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete crm_cards" ON public.crm_cards
  FOR DELETE TO authenticated USING (true);

-- CRM Columns table
CREATE POLICY "Authenticated users can view crm_columns" ON public.crm_columns
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert crm_columns" ON public.crm_columns
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update crm_columns" ON public.crm_columns
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete crm_columns" ON public.crm_columns
  FOR DELETE TO authenticated USING (true);

-- Miles Inventory table
CREATE POLICY "Authenticated users can view miles_inventory" ON public.miles_inventory
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert miles_inventory" ON public.miles_inventory
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update miles_inventory" ON public.miles_inventory
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete miles_inventory" ON public.miles_inventory
  FOR DELETE TO authenticated USING (true);

-- Miles Programs table
CREATE POLICY "Authenticated users can view miles_programs" ON public.miles_programs
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert miles_programs" ON public.miles_programs
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update miles_programs" ON public.miles_programs
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete miles_programs" ON public.miles_programs
  FOR DELETE TO authenticated USING (true);

-- Miles Transactions table
CREATE POLICY "Authenticated users can view miles_transactions" ON public.miles_transactions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert miles_transactions" ON public.miles_transactions
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update miles_transactions" ON public.miles_transactions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete miles_transactions" ON public.miles_transactions
  FOR DELETE TO authenticated USING (true);

-- Sale Installments table
CREATE POLICY "Authenticated users can view sale_installments" ON public.sale_installments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert sale_installments" ON public.sale_installments
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update sale_installments" ON public.sale_installments
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete sale_installments" ON public.sale_installments
  FOR DELETE TO authenticated USING (true);

-- Sale Products table
CREATE POLICY "Authenticated users can view sale_products" ON public.sale_products
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert sale_products" ON public.sale_products
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update sale_products" ON public.sale_products
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete sale_products" ON public.sale_products
  FOR DELETE TO authenticated USING (true);

-- Sales table
CREATE POLICY "Authenticated users can view sales" ON public.sales
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert sales" ON public.sales
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update sales" ON public.sales
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete sales" ON public.sales
  FOR DELETE TO authenticated USING (true);

-- Suppliers table
CREATE POLICY "Authenticated users can view suppliers" ON public.suppliers
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert suppliers" ON public.suppliers
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update suppliers" ON public.suppliers
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete suppliers" ON public.suppliers
  FOR DELETE TO authenticated USING (true);

-- Transactions table
CREATE POLICY "Authenticated users can view transactions" ON public.transactions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert transactions" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update transactions" ON public.transactions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete transactions" ON public.transactions
  FOR DELETE TO authenticated USING (true);