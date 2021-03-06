import math

class LCG:
	# Inicializa o algoritmo com o tamanho desejado
	# dos valores gerados e uma semente.
	def __init__(self, size, seed):
		# Permite um cálculo do módulo mais eficiente e torna
		# mais simples encontrar valores válidos para os parâmetros
		# a e c.
		self.m = 2 ** (2 * size)

		# Valor usado pelo Borland C/C++. Satisfaz todas as
		# condições de período completo do algoritmo.
		self.a = 22695477

		# Qualquer valor relativamente primo a m é válido. Opta-se
		# aqui por um valor simples.
		self.c = 1

		# Armazena a semente inicial e o tamanho desejado.
		self.seed = seed
		self.size = size

	# Gera um novo valor aleatório e o retorna.
	def generate(self):
		self.seed = (self.a * self.seed + self.c) % self.m
		bin_value_size = math.ceil(math.log2(self.seed + 1))
		# Pega os N+1 bits mais significativos, onde N é o
		# tamanho desejado pelo usuário.
		significant_part = self.seed >> (bin_value_size - (self.size + 1))
		# Remove o bit mais significativo do resultado anterior.
		return significant_part ^ (2 ** self.size)
