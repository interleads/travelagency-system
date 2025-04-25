
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CartItem } from "@/types/pos";

interface CartTableProps {
  items: CartItem[];
  onRemoveItem: (id: number) => void;
}

const CartTable: React.FC<CartTableProps> = ({ items, onRemoveItem }) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carrinho de Compras</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Qtd</TableHead>
              <TableHead className="text-right">Preço Un.</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Carrinho vazio
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    R$ {item.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => onRemoveItem(item.id)}
                    >
                      Remover
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-lg font-bold">Total:</div>
        <div className="text-2xl font-bold text-emerald-600">
          R$ {total.toFixed(2)}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CartTable;
