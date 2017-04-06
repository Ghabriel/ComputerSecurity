class BlumBlumShub:
	# Inicializa o algoritmo com o tamanho desejado
	# dos valores gerados e uma semente.
	def __init__(self, size, seed):
		# Primos de Mersenne usados como base para o parâmetro M.
		# Ambas as condições necessárias são cumpridas, isto é:
		# 	p e q são congruentes a 3 (mod 4)
		#	mdc(phi(p), phi(q)) é pequeno (6)
		p = (2 ** 2203) - 1
		q = (2 ** 4253) - 1

		# Calcula o parâmetro M do algoritmo.
		self.m = p * q

		# Evita que a semente assuma os valores 0 ou 1.
		seed = max(2, seed)

		# Garante que o valor da semente seja co-primo a M.
		if seed % 2 == 1:
			seed += 1

		# Armazena a semente inicial e o tamanho desejado.
		self.seed = seed
		self.size = size

	# Gera um novo valor aleatório e o retorna.
	def generate(self):
		self.seed = (self.seed * self.seed) % self.m
		bin_value = bin(self.seed)[2:]
		# Obtém os N bits menos significativos da nova semente,
		# onde N é o tamanho desejado, e retorna sua
		# representação decimal.
		return int(bin_value[-self.size:], 2)
