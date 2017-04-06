class LCG:
	# Inicializa o algoritmo com o tamanho desejado
	# dos valores gerados e uma semente.
	def __init__(self, size, seed):
		# Permite um cálculo do módulo mais eficiente e torna
		# mais simples encontrar valores válidos para os parâmetros
		# a e c.
		self.m = 2 ** size

		# Valor usado pelo Borland C/C++. Satisfaz todas as
		# condições de período completo do algoritmo.
		self.a = 22695477

		# Qualquer valor relativamente primo a m é válido. Opta-se
		# aqui por um valor simples.
		self.c = 1

		# Armazena a semente passada por parâmetro.
		self.seed = seed

	# Gera um novo valor aleatório e o retorna.
	def generate(self):
		self.seed = (self.a * self.seed + self.c) % self.m
		return self.seed
